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

    @Override
    public void sendPasswordResetEmail(String recipientEmail, String resetLink) {
        String subject = "Auto Apply Pro - Reset Your Password";
        String body = "Hello,\n\n"
                + "We received a request to reset the password for your Auto Apply Pro account.\n"
                + "Please click the link below to set a new password. This link is valid for 15 minutes:\n\n"
                + resetLink + "\n\n"
                + "If you did not request a password reset, please ignore this email.\n\n"
                + "Best regards,\n"
                + "The Auto Apply Pro Team";

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
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                log.info("Successfully sent password reset email to: {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send real email via SMTP, fell back to console logging: {}", e.getMessage());
            }
        }
    }

    @Override
    public void sendPlaqueCardContactEmail(String recipientEmail, String candidateName, String senderName, String senderEmail, String senderCompany, String message) {
        String subject = "New Recruiter Inquiry from your Auto Apply Pro Plaque Card!";
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
                + "The Auto Apply Pro Team";

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
                mailMessage.setReplyTo(senderEmail);
                mailMessage.setSubject(subject);
                mailMessage.setText(body);
                mailSender.send(mailMessage);
                log.info("Successfully sent plaque card contact email to: {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send real email via SMTP, fell back to console logging: {}", e.getMessage());
            }
        }
    }

    @Override
    public void sendEmailVerificationEmail(String recipientEmail, String verificationLink, String otpCode) {
        String subject = "Auto Apply Pro - Verify Your Email Address";
        String body = "Hello,\n\n"
                + "Thank you for registering with Auto Apply Pro!\n"
                + "Please verify your email address to activate your account. Your verification code is:\n\n"
                + "   VERIFICATION CODE: " + otpCode + "\n\n"
                + "Alternatively, you can click the link below to verify your email directly:\n\n"
                + verificationLink + "\n\n"
                + "This verification code/link is valid for 15 minutes.\n\n"
                + "If you did not create an account, please ignore this email.\n\n"
                + "Best regards,\n"
                + "The Auto Apply Pro Team";

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
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                log.info("Successfully sent verification email to: {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send verification email via SMTP, fell back to console logging: {}", e.getMessage());
            }
        }
    }
}
