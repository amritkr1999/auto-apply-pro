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
        GmailCredential credential = credentialRepository.findByUserId(userId)
                .orElseThrow(() -> new OutreachSendException(OutreachErrorType.UNAUTHORIZED, 
                        "Gmail account not connected for user ID: " + userId));

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
                com.backend.autoapplypro.modules.users.model.Candidate candidate = userService.getCandidateResume(userId);
                if (candidate != null && candidate.getResumeBytes() != null) {
                    resumeBytes = candidate.getResumeBytes();
                    resumeContentType = candidate.getResumeContentType();
                    resumeFilename = candidate.getResumeFilename();
                    log.info("Found resume for user ID: {}. File: {}, Size: {} bytes. Preparing attachment.", 
                            userId, resumeFilename, resumeBytes.length);
                }
            } catch (Exception e) {
                log.warn("Failed to retrieve candidate resume for user ID: {}. Sending without attachment. Error: {}", userId, e.getMessage());
            }

            // Construct MIME message
            MimeMessage mimeMessage = createMimeMessage(credential.getConnectedEmail(), to, subject, body, 
                    resumeBytes, resumeContentType, resumeFilename);
            
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
            log.error("GoogleJsonResponseException during delegated send. Code: {}, Message: {}", statusCode, e.getDetails().getMessage());
            
            if (statusCode == 400 || statusCode == 422 || (e.getDetails() != null && e.getDetails().getMessage().contains("Recipient address"))) {
                // Address rejection (analogous to 550)
                throw new OutreachSendException(OutreachErrorType.INVALID_RECIPIENT, "Invalid recipient address: " + to, e);
            } else if (statusCode == 429) {
                // Rate limits
                throw new OutreachSendException(OutreachErrorType.RATE_LIMITED, "Gmail API rate limit hit", e);
            } else if (statusCode == 401 || statusCode == 403) {
                // Unauthorized / connection revoked
                throw new OutreachSendException(OutreachErrorType.UNAUTHORIZED, "Gmail OAuth credential revoked or expired", e);
            } else {
                throw new OutreachSendException(OutreachErrorType.GENERIC, "Gmail API sending failed: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            log.error("Unexpected exception during delegated Gmail sending", e);
            throw new OutreachSendException(OutreachErrorType.GENERIC, "Unexpected sending failure: " + e.getMessage(), e);
        }
    }

    private MimeMessage createMimeMessage(String from, String to, String subject, String body, 
                                           byte[] attachmentBytes, String contentType, String filename) throws Exception {
        MimeMessage mimeMessage = new MimeMessage(Session.getDefaultInstance(new Properties()));
        mimeMessage.setFrom(new InternetAddress(from));
        mimeMessage.addRecipient(MimeMessage.RecipientType.TO, new InternetAddress(to));
        mimeMessage.setSubject(subject, "UTF-8");

        if (attachmentBytes != null && attachmentBytes.length > 0) {
            MimeMultipart multipart = new MimeMultipart();

            // 1. HTML body part
            MimeBodyPart bodyPart = new MimeBodyPart();
            bodyPart.setContent(body, "text/html; charset=UTF-8");
            multipart.addBodyPart(bodyPart);

            // 2. Attachment part
            MimeBodyPart attachmentPart = new MimeBodyPart();
            ByteArrayDataSource source = new ByteArrayDataSource(attachmentBytes, 
                    contentType != null ? contentType : "application/octet-stream");
            attachmentPart.setDataHandler(new DataHandler(source));
            attachmentPart.setFileName(filename != null ? filename : "resume.pdf");
            multipart.addBodyPart(attachmentPart);

            mimeMessage.setContent(multipart);
        } else {
            mimeMessage.setContent(body, "text/html; charset=UTF-8");
        }
        return mimeMessage;
    }
}
