package com.backend.autoapplypro.modules.users.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SystemEmailServiceImpl implements SystemEmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${app.email.notifications:notifications@easynaukri.online}")
    private String fromEmail;

    @org.springframework.beans.factory.annotation.Value("${app.email.support:support@easynaukri.online}")
    private String supportEmail;

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendPasswordResetEmail(String recipientEmail, String resetLink) {
        String subject = "EasyNaukri - Reset Your Password";
        String body = "Hello,\n\n"
                + "We received a request to reset the password for your EasyNaukri account.\n"
                + "Please click the link below to set a new password. This link is valid for 15 minutes:\n\n"
                + resetLink + "\n\n"
                + "If you did not request a password reset, please ignore this email.\n\n"
                + "Best regards,\n"
                + "The EasyNaukri Team";

        // Console Logging (Simplicity & Security as requested)
        log.info("\n==================================================\n"
                + "[SYSTEM EMAIL OUTBOX]\n"
                + "To: {}\n"
                + "Subject: {}\n"
                + "Body:\n{}\n"
                + "==================================================",
                recipientEmail, subject, body);

        // Real mail sending fallback if JavaMailSender is configured
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipientEmail);
                if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                    message.setFrom(fromEmail);
                }
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                log.info("Successfully sent password reset email to: {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send real email via SMTP, fell back to console logging: {}", e.getMessage(), e);
            }
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendPlaqueCardContactEmail(String recipientEmail, String candidateName, String senderName, String senderEmail, String senderCompany, String message) {
        String subject = "New Recruiter Inquiry from your EasyNaukri Plaque Card!";
        String body = "Hello " + candidateName + ",\n\n"
                + "A visitor left you a message on your Virtual Visiting Card (Plaque Card):\n\n"
                + "--------------------------------------------------\n"
                + "Sender: " + senderName + "\n"
                + "Email: " + senderEmail + "\n"
                + "Company: " + (senderCompany != null && !senderCompany.trim().isEmpty() ? senderCompany : "N/A") + "\n\n"
                + "Message:\n" + message + "\n"
                + "--------------------------------------------------\n\n"
                + "You can reply directly to this email to get in touch with them.\n\n"
                + "Best regards,\n"
                + "The EasyNaukri Team";

        log.info("\n==================================================\n"
                + "[SYSTEM EMAIL OUTBOX - PLAQUE CARD CONTACT]\n"
                + "To: {}\n"
                + "Subject: {}\n"
                + "Body:\n{}\n"
                + "==================================================",
                recipientEmail, subject, body);

        if (mailSender != null) {
            try {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setTo(recipientEmail);
                if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                    mailMessage.setFrom(fromEmail);
                }
                mailMessage.setReplyTo(senderEmail);
                mailMessage.setSubject(subject);
                mailMessage.setText(body);
                mailSender.send(mailMessage);
                log.info("Successfully sent plaque card contact email to: {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send real email via SMTP, fell back to console logging: {}", e.getMessage(), e);
            }
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendEmailVerificationEmail(String recipientEmail, String verificationLink, String otpCode) {
        String subject = "EasyNaukri - Verify Your Email Address";
        String body = "Hello,\n\n"
                + "Thank you for registering with EasyNaukri!\n"
                + "Please verify your email address to activate your account. Your verification code is:\n\n"
                + "   VERIFICATION CODE: " + otpCode + "\n\n"
                + "Alternatively, you can click the link below to verify your email directly:\n\n"
                + verificationLink + "\n\n"
                + "This verification code/link is valid for 15 minutes.\n\n"
                + "If you did not create an account, please ignore this email.\n\n"
                + "Best regards,\n"
                + "The EasyNaukri Team";

        log.info("\n==================================================\n"
                + "[SYSTEM EMAIL OUTBOX - EMAIL VERIFICATION]\n"
                + "To: {}\n"
                + "Subject: {}\n"
                + "Verification Code (OTP): {}\n"
                + "Body:\n{}\n"
                + "==================================================",
                recipientEmail, subject, otpCode, body);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipientEmail);
                if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                    message.setFrom(fromEmail);
                }
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                log.info("Successfully sent verification email to: {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send verification email via SMTP, fell back to console logging: {}", e.getMessage(), e);
            }
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendDailyDigestEmail(String recipientEmail, String subject, String htmlContent) {
        log.info("\n==================================================\n"
                + "[SYSTEM EMAIL OUTBOX - DAILY EOD DIGEST]\n"
                + "To: {}\n"
                + "Subject: {}\n"
                + "Content Length: {} chars\n"
                + "==================================================",
                recipientEmail, subject, htmlContent != null ? htmlContent.length() : 0);

        if (mailSender != null) {
            try {
                jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
                org.springframework.mail.javamail.MimeMessageHelper helper = 
                        new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(recipientEmail);
                if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                    helper.setFrom(fromEmail);
                }
                helper.setSubject(subject);
                helper.setText(htmlContent, true); // true = isHtml
                mailSender.send(mimeMessage);
                log.info("Successfully sent Daily EOD Digest email to: {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send Daily EOD Digest email via SMTP, fell back to log: {}", e.getMessage(), e);
            }
        }
    }
}
