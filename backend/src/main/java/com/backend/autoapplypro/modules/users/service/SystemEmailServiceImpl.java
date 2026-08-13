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
                String senderAddr = (fromEmail != null && !fromEmail.trim().isEmpty()) ? fromEmail : "notifications@easynaukri.online";
                message.setFrom("EasyNaukri Team <" + senderAddr + ">");
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
                String senderAddr = (fromEmail != null && !fromEmail.trim().isEmpty()) ? fromEmail : "notifications@easynaukri.online";
                mailMessage.setFrom("EasyNaukri Team <" + senderAddr + ">");
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
                String senderAddr = (fromEmail != null && !fromEmail.trim().isEmpty()) ? fromEmail : "notifications@easynaukri.online";
                message.setFrom("EasyNaukri Team <" + senderAddr + ">");
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
                String senderAddr = (fromEmail != null && !fromEmail.trim().isEmpty()) ? fromEmail : "notifications@easynaukri.online";
                helper.setFrom(new jakarta.mail.internet.InternetAddress(senderAddr, "EasyNaukri Team"));
                helper.setSubject(subject);
                helper.setText(htmlContent, true); // true = isHtml
                mailSender.send(mimeMessage);
                log.info("Successfully sent Daily EOD Digest email to: {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send Daily EOD Digest email via SMTP, fell back to log: {}", e.getMessage(), e);
            }
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendGeneralContactEmail(com.backend.autoapplypro.modules.users.dto.ContactRequestDto request) {
        String targetSupportEmail = (supportEmail != null && !supportEmail.trim().isEmpty()) ? supportEmail : "support@easynaukri.online";
        String categoryStr = request.getCategory() != null ? "[" + request.getCategory().toUpperCase() + "] " : "[GENERAL] ";
        String subject = "EasyNaukri Contact Us Inquiry: " + categoryStr + (request.getSubject() != null ? request.getSubject() : "No Subject");
        
        String body = "Hello EasyNaukri Team,\n\n"
                + "A user has submitted a new inquiry via the Contact Us form:\n\n"
                + "--------------------------------------------------\n"
                + "Name: " + (request.getName() != null ? request.getName() : "Anonymous") + "\n"
                + "Email: " + (request.getEmail() != null ? request.getEmail() : "Not Provided") + "\n"
                + "Phone/WhatsApp: " + (request.getPhone() != null && !request.getPhone().trim().isEmpty() ? request.getPhone() : "Not Provided") + "\n"
                + "Category: " + (request.getCategory() != null ? request.getCategory() : "General Inquiry") + "\n"
                + "Subject: " + (request.getSubject() != null ? request.getSubject() : "N/A") + "\n\n"
                + "Message:\n" + (request.getMessage() != null ? request.getMessage() : "") + "\n"
                + "--------------------------------------------------\n\n"
                + "You can reply directly to this email to respond to the user (" + request.getEmail() + ").\n\n"
                + "Best regards,\n"
                + "EasyNaukri Automated Contact Desk";

        log.info("\n==================================================\n"
                + "[SYSTEM EMAIL OUTBOX - GENERAL CONTACT FORM]\n"
                + "Target Support Inbox: {}\n"
                + "From User: {} <{}>\n"
                + "Subject: {}\n"
                + "Body:\n{}\n"
                + "==================================================",
                targetSupportEmail, request.getName(), request.getEmail(), subject, body);

        if (mailSender != null) {
            try {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setTo(targetSupportEmail);
                String senderAddr = (fromEmail != null && !fromEmail.trim().isEmpty()) ? fromEmail : "notifications@easynaukri.online";
                mailMessage.setFrom("EasyNaukri Team <" + senderAddr + ">");
                if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                    mailMessage.setReplyTo(request.getEmail());
                }
                mailMessage.setSubject(subject);
                mailMessage.setText(body);
                mailSender.send(mailMessage);
                log.info("Successfully sent contact form email to support inbox: {}", targetSupportEmail);
            } catch (Exception e) {
                log.error("Failed to send contact form email via SMTP, fell back to console log: {}", e.getMessage(), e);
            }
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendCareersInterestAcknowledgementEmail(String recipientEmail) {
        String subject = "EasyNaukri - We've Received Your Interest for Job Opening Updates!";
        String body = "Hello,\n\n"
                + "Thank you for subscribing to job opening updates at EasyNaukri!\n\n"
                + "We have received your email (" + recipientEmail + "). From now on, you will be among the first to be updated whenever new job positions, engineering roles, and team expansions open up at EasyNaukri.\n\n"
                + "We are excited to have you in our talent network!\n\n"
                + "Best regards,\n"
                + "The EasyNaukri Careers Team\n"
                + "https://easynaukri.online";

        log.info("\n==================================================\n"
                + "[SYSTEM EMAIL OUTBOX - CAREERS INTEREST ACKNOWLEDGEMENT]\n"
                + "To: {}\n"
                + "Subject: {}\n"
                + "Body:\n{}\n"
                + "==================================================",
                recipientEmail, subject, body);

        if (mailSender != null) {
            try {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setTo(recipientEmail);
                String senderAddr = (fromEmail != null && !fromEmail.trim().isEmpty()) ? fromEmail : "notifications@easynaukri.online";
                mailMessage.setFrom("EasyNaukri Careers <" + senderAddr + ">");
                mailMessage.setSubject(subject);
                mailMessage.setText(body);
                mailSender.send(mailMessage);
                log.info("Successfully sent careers interest acknowledgement email to: {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send careers interest acknowledgement email via SMTP, fell back to console log: {}", e.getMessage(), e);
            }
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendTrialWarningEmail(String recipientEmail, String userName, long daysRemaining) {
        String subject = "⏳ EasyNaukri - Your Elite Autopilot Free Trial Ends in " + daysRemaining + " Days!";
        String body = "Hi " + (userName != null ? userName : "there") + ",\n\n"
                + "Just a quick heads-up: your 15-day free trial of EasyNaukri Elite Autopilot will expire in " + daysRemaining + " days.\n\n"
                + "During your trial, you get:\n"
                + "  • 50 Daily AI-Automated Applications\n"
                + "  • Priority DeepSeek AI Processing\n"
                + "  • Multi-Template Job Profiles\n\n"
                + "To keep your 50 daily application volume and priority AI features active without interruption, upgrade your subscription today from your Billing Portal:\n"
                + "https://easynaukri.online/pricing\n\n"
                + "Happy job hunting!\n"
                + "The EasyNaukri Team";

        log.info("[SYSTEM EMAIL OUTBOX - TRIAL WARNING] To: {}, Days: {}", recipientEmail, daysRemaining);
        if (mailSender != null) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setTo(recipientEmail);
                msg.setFrom("EasyNaukri Team <" + (fromEmail != null ? fromEmail : "notifications@easynaukri.online") + ">");
                msg.setSubject(subject);
                msg.setText(body);
                mailSender.send(msg);
            } catch (Exception e) {
                log.error("Failed sending trial warning email: {}", e.getMessage());
            }
        }
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendTrialExpiredEmail(String recipientEmail, String userName) {
        String subject = "📢 EasyNaukri - Your 15-Day Free Trial Has Ended";
        String body = "Hi " + (userName != null ? userName : "there") + ",\n\n"
                + "Your 15-day free trial of EasyNaukri Elite Autopilot has concluded.\n\n"
                + "Your account has automatically transitioned to the Free Tier (15 daily applications).\n"
                + "Don't lose momentum in your job search! You can re-unlock 50 daily applications and priority AI generation anytime by subscribing to Candidate Pro or Elite Autopilot:\n\n"
                + "👉 Upgrade Now: https://easynaukri.online/pricing\n\n"
                + "Thank you for using EasyNaukri!\n"
                + "The EasyNaukri Team";

        log.info("[SYSTEM EMAIL OUTBOX - TRIAL EXPIRED] To: {}", recipientEmail);
        if (mailSender != null) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setTo(recipientEmail);
                msg.setFrom("EasyNaukri Team <" + (fromEmail != null ? fromEmail : "notifications@easynaukri.online") + ">");
                msg.setSubject(subject);
                msg.setText(body);
                mailSender.send(msg);
            } catch (Exception e) {
                log.error("Failed sending trial expired email: {}", e.getMessage());
            }
        }
    }
}

