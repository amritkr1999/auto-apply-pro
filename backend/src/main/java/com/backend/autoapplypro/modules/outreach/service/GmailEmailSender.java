package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.outreach.exception.OutreachErrorType;
import com.backend.autoapplypro.modules.outreach.exception.OutreachSendException;
import com.backend.autoapplypro.modules.outreach.model.GmailCredential;
import com.backend.autoapplypro.modules.outreach.repository.GmailCredentialRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.util.ByteArrayDataSource;
import jakarta.activation.DataHandler;
import com.backend.autoapplypro.modules.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Properties;

@Service
@RequiredArgsConstructor
@Slf4j
public class GmailEmailSender implements EmailSender {

    private final GmailCredentialRepository credentialRepository;
    private final UserService userService;

    @Value("${spring.security.oauth2.client.registration.google.client-id:dev-client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:dev-client-secret}")
    private String clientSecret;

    @Override
    public void sendEmail(Long userId, String to, String subject, String body) {
        sendEmail(userId, to, null, subject, body);
    }

    @Override
    public void sendEmail(Long userId, String to, String cc, String subject, String body) {
        sendEmail(userId, to, cc, subject, body, null, null, null);
    }

    @Override
    public void sendEmail(Long userId, String to, String cc, String subject, String body, 
                          byte[] coverLetterBytes, String coverLetterContentType, String coverLetterFilename) {
        GmailCredential credential = credentialRepository.findByUserId(userId)
                .orElseThrow(() -> new OutreachSendException(OutreachErrorType.UNAUTHORIZED, 
                        "Gmail account not connected for user ID: " + userId));

        // If in development mode or using placeholder/mock credentials, bypass external Google API network call
        if (isDevOrPlaceholderClientId(clientId) ||
            (credential.getAccessToken() != null && credential.getAccessToken().startsWith("mock_"))) {
            log.info("[DEV/PLACEHOLDER MODE] Simulated Gmail dispatch for user ID: {} to: {}. Subject: {}, Has Cover Letter Attachment: {}", 
                    userId, to, subject, coverLetterBytes != null && coverLetterBytes.length > 0);
            return;
        }

        try {
            // Build Google credentials with auto-refresh capability
            GoogleCredential googleCredential = new GoogleCredential.Builder()
                    .setTransport(new NetHttpTransport())
                    .setJsonFactory(GsonFactory.getDefaultInstance())
                    .setClientSecrets(clientId, clientSecret)
                    .build()
                    .setAccessToken(credential.getAccessToken())
                    .setRefreshToken(credential.getRefreshToken());

            // Build Gmail Service instance
            Gmail gmailService = new Gmail.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance(), googleCredential)
                    .setApplicationName("AutoApplyPro")
                    .build();

            // Fetch candidate resume details if uploaded
            byte[] resumeBytes = null;
            String resumeContentType = null;
            String resumeFilename = null;
            try {
                com.backend.autoapplypro.modules.users.model.ProfessionalProfile candidate = userService.getCandidateResume(userId);
                if (candidate != null && candidate.getResumeBytes() != null) {
                    resumeBytes = candidate.getResumeBytes();
                    resumeContentType = candidate.getResumeContentType();
                    resumeFilename = candidate.getResumeFilename();
                    log.info("Found resume for user ID: {}. File: {}, Size: {} bytes. Preparing attachment.", 
                            userId, resumeFilename, resumeBytes.length);
                }
            } catch (Exception e) {
                log.warn("Failed to retrieve candidate resume for user ID: {}. Error: {}", userId, e.getMessage());
            }

            // Construct MIME message
            MimeMessage mimeMessage = createMimeMessage(credential.getConnectedEmail(), to, cc, subject, body, 
                    resumeBytes, resumeContentType, resumeFilename,
                    coverLetterBytes, coverLetterContentType, coverLetterFilename);
            
            // Serialize and Base64-encode
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            mimeMessage.writeTo(buffer);
            byte[] rawBytes = buffer.toByteArray();
            String encodedEmail = Base64.getUrlEncoder().encodeToString(rawBytes);

            Message message = new Message();
            message.setRaw(encodedEmail);

            log.info("Attempting to send delegated Gmail for user: {} to: {}", credential.getConnectedEmail(), to);
            
            // Execute send call
            gmailService.users().messages().send("me", message).execute();
            
            // Update database with refreshed accessToken if GoogleCredential auto-refreshed it
            if (googleCredential.getAccessToken() != null && !googleCredential.getAccessToken().equals(credential.getAccessToken())) {
                log.info("Access token auto-refreshed by Google Client. Updating database credential record.");
                credential.setAccessToken(googleCredential.getAccessToken());
                credentialRepository.save(credential);
            }

            log.info("Delegated Gmail sent successfully to {}", to);

        } catch (GoogleJsonResponseException e) {
            int statusCode = e.getStatusCode();
            log.error("GoogleJsonResponseException during delegated send. Code: {}, Details: {}", 
                    statusCode, e.getDetails() != null ? e.getDetails().toString() : e.getMessage(), e);
            
            if (statusCode == 400 || statusCode == 422 || (e.getDetails() != null && e.getDetails().getMessage() != null && e.getDetails().getMessage().contains("Recipient address"))) {
                throw new OutreachSendException(OutreachErrorType.INVALID_RECIPIENT, "Invalid recipient address: " + to, e);
            } else if (statusCode == 429) {
                throw new OutreachSendException(OutreachErrorType.RATE_LIMITED, "Gmail API rate limit hit", e);
            } else if (statusCode == 401 || statusCode == 403) {
                String msg = "Gmail OAuth credential revoked or expired";
                if (e.getDetails() != null && e.getDetails().getMessage() != null) {
                    msg += ": " + e.getDetails().getMessage();
                }
                throw new OutreachSendException(OutreachErrorType.UNAUTHORIZED, msg, e);
            } else {
                throw new OutreachSendException(OutreachErrorType.PROVIDER_ERROR, 
                        "Gmail API Error: " + (e.getDetails() != null ? e.getDetails().getMessage() : e.getMessage()), e);
            }
        } catch (OutreachSendException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error sending email via Gmail for user ID: {}", userId, e);
            throw new OutreachSendException(OutreachErrorType.SYSTEM_ERROR, 
                    "Failed to send email via Gmail: " + e.getMessage(), e);
        }
    }

    public void createDraft(Long userId, String to, String cc, String subject, String body) {
        GmailCredential credential = credentialRepository.findByUserId(userId)
                .orElseThrow(() -> new OutreachSendException(OutreachErrorType.UNAUTHORIZED, 
                        "Gmail account not connected for user ID: " + userId));

        if (isDevOrPlaceholderClientId(clientId) ||
            (credential.getAccessToken() != null && credential.getAccessToken().startsWith("mock_"))) {
            log.info("[DEV/PLACEHOLDER MODE] Simulated Gmail draft creation for user ID: {} to: {}. Subject: {}", userId, to, subject);
            return;
        }

        try {
            GoogleCredential googleCredential = new GoogleCredential.Builder()
                    .setTransport(new NetHttpTransport())
                    .setJsonFactory(GsonFactory.getDefaultInstance())
                    .setClientSecrets(clientId, clientSecret)
                    .build()
                    .setAccessToken(credential.getAccessToken())
                    .setRefreshToken(credential.getRefreshToken());

            Gmail gmailService = new Gmail.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance(), googleCredential)
                    .setApplicationName("AutoApplyPro")
                    .build();

            MimeMessage mimeMessage = createMimeMessage(credential.getConnectedEmail(), to, cc, subject, body, null, null, null, null, null, null);
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            mimeMessage.writeTo(buffer);
            String encodedEmail = Base64.getUrlEncoder().encodeToString(buffer.toByteArray());

            Message message = new Message();
            message.setRaw(encodedEmail);

            com.google.api.services.gmail.model.Draft draft = new com.google.api.services.gmail.model.Draft();
            draft.setMessage(message);

            gmailService.users().drafts().create("me", draft).execute();
            log.info("Successfully created Gmail draft for user: {} to: {}", credential.getConnectedEmail(), to);
        } catch (Exception e) {
            log.error("Failed to create Gmail draft for user ID: {}", userId, e);
            throw new RuntimeException("Failed to create Gmail draft: " + e.getMessage(), e);
        }
    }

    private boolean isDevOrPlaceholderClientId(String clientId) {
        if (clientId == null || clientId.trim().isEmpty()) return true;
        String id = clientId.trim().toLowerCase();
        return id.startsWith("dev-") || id.startsWith("your-") || !id.contains(".apps.googleusercontent.com");
    }

    private MimeMessage createMimeMessage(String from, String to, String cc, String subject, String body, 
                                           byte[] resumeBytes, String resumeContentType, String resumeFilename,
                                           byte[] coverLetterBytes, String coverLetterContentType, String coverLetterFilename) throws Exception {
        MimeMessage mimeMessage = new MimeMessage(Session.getDefaultInstance(new Properties()));
        mimeMessage.setFrom(new InternetAddress(from));
        mimeMessage.addRecipient(MimeMessage.RecipientType.TO, new InternetAddress(to));
        if (cc != null && !cc.trim().isEmpty()) {
            mimeMessage.addRecipients(MimeMessage.RecipientType.CC, InternetAddress.parse(cc));
        }
        mimeMessage.setSubject(subject, "UTF-8");

        boolean hasResume = resumeBytes != null && resumeBytes.length > 0;
        boolean hasCoverLetter = coverLetterBytes != null && coverLetterBytes.length > 0;

        if (hasResume || hasCoverLetter) {
            MimeMultipart multipart = new MimeMultipart();

            // 1. HTML body part
            MimeBodyPart bodyPart = new MimeBodyPart();
            bodyPart.setContent(body, "text/html; charset=UTF-8");
            multipart.addBodyPart(bodyPart);

            // 2. Resume attachment part
            if (hasResume) {
                MimeBodyPart resumePart = new MimeBodyPart();
                ByteArrayDataSource source = new ByteArrayDataSource(resumeBytes, 
                        resumeContentType != null ? resumeContentType : "application/octet-stream");
                resumePart.setDataHandler(new DataHandler(source));
                resumePart.setFileName(resumeFilename != null ? resumeFilename : "resume.pdf");
                multipart.addBodyPart(resumePart);
            }

            // 3. Cover Letter attachment part
            if (hasCoverLetter) {
                MimeBodyPart coverLetterPart = new MimeBodyPart();
                ByteArrayDataSource source = new ByteArrayDataSource(coverLetterBytes, 
                        coverLetterContentType != null ? coverLetterContentType : "application/pdf");
                coverLetterPart.setDataHandler(new DataHandler(source));
                coverLetterPart.setFileName(coverLetterFilename != null ? coverLetterFilename : "Cover_Letter.pdf");
                multipart.addBodyPart(coverLetterPart);
            }

            mimeMessage.setContent(multipart);
        } else {
            mimeMessage.setContent(body, "text/html; charset=UTF-8");
        }
        return mimeMessage;
    }
}
