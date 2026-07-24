package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketingEmailCampaignServiceImpl implements MarketingEmailCampaignService {

    private final UserRepository userRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Override
    @Transactional
    public void runDripCampaign() {
        LocalDateTime now = LocalDateTime.now();
        List<User> users = userRepository.findAll().stream()
                .filter(User::getMarketingEmailsEnabled)
                .filter(u -> u.getMarketingCampaignStep() != null && u.getMarketingCampaignStep() < 3)
                .toList();

        log.info("Evaluating marketing drips for {} eligible users.", users.size());

        for (User user : users) {
            LocalDateTime lastSent = user.getLastMarketingEmailSentAt();
            LocalDateTime signupDate = user.getCreatedAt();
            if (signupDate == null) {
                signupDate = now.minusDays(10); // fallback
            }

            int currentStep = user.getMarketingCampaignStep();
            boolean shouldSend = false;
            String subject = "";
            String htmlContent = "";

            if (currentStep == 0) {
                // Day 1: Send after 24 hours of signup
                if (signupDate.isBefore(now.minusHours(24))) {
                    shouldSend = true;
                    subject = "Welcome to Auto Apply Pro - Let's get you hired!";
                    htmlContent = getWelcomeEmailTemplate(user);
                    user.setMarketingCampaignStep(1);
                }
            } else if (currentStep == 1) {
                // Day 3: Send after 3 days of signup (and at least 48 hours after step 1)
                if (signupDate.isBefore(now.minusDays(3)) && (lastSent == null || lastSent.isBefore(now.minusHours(48)))) {
                    shouldSend = true;
                    subject = "Skip the application fatigue: How our AI outreach works";
                    htmlContent = getAhaEmailTemplate(user);
                    user.setMarketingCampaignStep(2);
                }
            } else if (currentStep == 2) {
                // Day 7: Send after 7 days of signup (and at least 96 hours after step 2)
                if (signupDate.isBefore(now.minusDays(7)) && (lastSent == null || lastSent.isBefore(now.minusHours(96)))) {
                    shouldSend = true;
                    subject = "Your dream job is waiting. Go Unlimited!";
                    htmlContent = getPitchEmailTemplate(user);
                    user.setMarketingCampaignStep(3);
                }
            }

            if (shouldSend) {
                try {
                    sendHtmlEmail(user.getEmail(), subject, htmlContent);
                    user.setLastMarketingEmailSentAt(now);
                    userRepository.save(user);
                    log.info("Successfully processed and sent marketing drip (Step {}) to: {}", currentStep, user.getEmail());
                } catch (Exception e) {
                    log.error("Failed to send marketing email drip to user: {}", user.getEmail(), e);
                }
            }
        }
    }

    @Override
    @Transactional
    public void sendWelcomeEmail(User user) {
        if (Boolean.TRUE.equals(user.getMarketingEmailsEnabled())) {
            try {
                String subject = "Welcome to Auto Apply Pro - Let's get you hired!";
                String htmlContent = getWelcomeEmailTemplate(user);
                sendHtmlEmail(user.getEmail(), subject, htmlContent);
                user.setMarketingCampaignStep(1);
                user.setLastMarketingEmailSentAt(LocalDateTime.now());
                userRepository.save(user);
                log.info("Successfully sent immediate welcome email to: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send immediate welcome email to user: {}", user.getEmail(), e);
            }
        } else {
            log.info("Skipping welcome email for user: {} - marketing emails are disabled.", user.getEmail());
        }
    }


    @Override
    @Transactional
    public void sendDailyLimitExceededEmail(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            if (Boolean.TRUE.equals(user.getMarketingEmailsEnabled())) {
                LocalDateTime lastSent = user.getLastMarketingEmailSentAt();
                if (lastSent == null || lastSent.isBefore(LocalDateTime.now().minusHours(24))) {
                    String subject = "You've reached your daily limit! Upgrade to keep applying.";
                    String htmlContent = getDailyLimitExceededEmailTemplate(user);
                    try {
                        sendHtmlEmail(user.getEmail(), subject, htmlContent);
                        user.setLastMarketingEmailSentAt(LocalDateTime.now());
                        userRepository.save(user);
                        log.info("Sent daily limit exceeded conversion email to user: {}", user.getEmail());
                    } catch (Exception e) {
                        log.error("Failed to send daily limit conversion email to user: {}", user.getEmail(), e);
                    }
                } else {
                    log.info("Skipping daily limit email for user: {} - email was sent recently (last sent: {})", 
                            user.getEmail(), lastSent);
                }
            }
        });
    }

    @Override
    @Transactional
    public void unsubscribeUser(String token) {
        User user = userRepository.findByUnsubscribeToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid unsubscribe token: " + token));
        user.setMarketingEmailsEnabled(false);
        userRepository.save(user);
        log.info("User unsubscribed successfully via token. Email: {}", user.getEmail());
    }

    private void sendHtmlEmail(String recipientEmail, String subject, String htmlContent) throws Exception {
        // Output detailed log of the email inside a formatted block for dev visibility
        log.info("\n==================================================\n"
                + "[SYSTEM MARKETING EMAIL OUTBOX]\n"
                + "To: {}\n"
                + "Subject: {}\n"
                + "Body HTML Preview:\n"
                + "--------------------------------------------------\n"
                + "{}\n"
                + "==================================================",
                recipientEmail, subject, htmlContent);

        if (mailSender != null) {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                helper.setFrom(fromEmail);
            }
            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            log.info("SMTP sent HTML email successfully to: {}", recipientEmail);
        } else {
            log.warn("JavaMailSender is not configured. Falling back to log simulation.");
        }
    }

    private String getUnsubscribeUrl(User user) {
        String token = user.getUnsubscribeToken();
        if (token == null || token.trim().isEmpty()) {
            token = java.util.UUID.randomUUID().toString();
            user.setUnsubscribeToken(token);
            userRepository.save(user);
        }
        return frontendUrl + "/unsubscribe?token=" + token;
    }

    private String getWelcomeEmailTemplate(User user) {
        String body = "<p style=\"font-size: 18px; font-weight: 500; color: #4f46e5; margin-bottom: 24px;\">Hello " + user.getName() + ", welcome onboard, let's get you hired!</p>\n" +
                "<p>Welcome to Auto Apply Pro! We are thrilled to help you automate your job search and eliminate application fatigue. Here is what we bring to your career journey:</p>\n" +
                "\n" +
                "<h3 style=\"color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px;\">Services We Provide</h3>\n" +
                "<ul style=\"padding-left: 20px; line-height: 1.8;\">\n" +
                "  <li><strong>AI-Driven Application Outreach</strong>: Custom local AI models scan job descriptions, extract recruiter contact details, and draft highly personalized cold emails automatically.</li>\n" +
                "  <li><strong>Smart Resume & Profile Parsing</strong>: Extract and align key skills from your PDF resume with matching roles.</li>\n" +
                "  <li><strong>Automated Outreach Scheduling</strong>: Intelligent queuing that spaces out applications to stay within recruiter safe-limits and respect weekend/active hour constraints.</li>\n" +
                "  <li><strong>Application CRM Tracker</strong>: Track applications, outbound outreach emails, and recruiter replies dynamically from your central dashboard.</li>\n" +
                "</ul>\n" +
                "\n" +
                "<h3 style=\"color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px;\">Our Subscription Plans</h3>\n" +
                "<ul style=\"padding-left: 20px; line-height: 1.8;\">\n" +
                "  <li><strong>Free Tier</strong>: 50 AI outreach drafts and sends per day, basic tracking dashboard, standard interval queuing.</li>\n" +
                "  <li><strong>Premium Tier</strong>: Unlimited daily outreach drafts, priority DeepSeek-OCR processing, multiple job search profiles/portfolios, and automated response alerts.</li>\n" +
                "</ul>\n" +
                "\n" +
                "<h3 style=\"color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px;\">Our Achievements</h3>\n" +
                "<ul style=\"padding-left: 20px; line-height: 1.8;\">\n" +
                "  <li><strong>10 Million+</strong> automated applications and outreaches successfully delivered.</li>\n" +
                "  <li><strong>15+ Hours Saved Weekly</strong> on average per active job seeker.</li>\n" +
                "  <li><strong>40% Increase</strong> in recruiter positive response rates compared to standard board applying.</li>\n" +
                "</ul>\n" +
                "\n" +
                "<div class=\"button-container\" style=\"margin-top: 32px;\">\n" +
                "  <a href=\"" + frontendUrl + "/login\" class=\"button\">Complete Your Profile & Start Applying</a>\n" +
                "</div>";
        return getHtmlLayout("Welcome to Auto Apply Pro", body, getUnsubscribeUrl(user));
    }

    private String getAhaEmailTemplate(User user) {
        String body = "<p>Hi " + user.getName() + ",</p>\n" +
                "<p>Are you tired of spending hours crafting the perfect email to recruiters?</p>\n" +
                "<p>Auto Apply Pro uses custom local AI models to scan job descriptions, find matching recruiter contacts, and draft hyper-personalized cold outreach emails automatically.</p>\n" +
                "<p>All you have to do is review the draft, click approve, and we handle the rest. Our users report saving up to 15 hours per week!</p>\n" +
                "<div class=\"button-container\">\n" +
                "  <a href=\"" + frontendUrl + "/login\" class=\"button\">Try Auto-Outreach Now</a>\n" +
                "</div>";
        return getHtmlLayout("Automate Your Job Applications", body, getUnsubscribeUrl(user));
    }

    private String getPitchEmailTemplate(User user) {
        String body = "<p>Hi " + user.getName() + ",</p>\n" +
                "<h2 style=\"color: #4f46e5; margin-top: 0;\">Your dream job is waiting. Go Unlimited!</h2>\n" +
                "<p>Free tier users are limited to a handful of outreach drafts per day. To truly accelerate your career growth, you need consistent, high-volume, automated outreach.</p>\n" +
                "<p>Upgrade to <strong>Auto Apply Pro Premium</strong> today to unlock:</p>\n" +
                "<ul>\n" +
                "  <li><strong>Unlimited daily email drafts</strong> and outreaches</li>\n" +
                "  <li><strong>Priority access</strong> to faster local deepseek-ocr processing</li>\n" +
                "  <li><strong>Multiple profile portfolios</strong> to apply for different roles</li>\n" +
                "  <li><strong>Real-time status tracking</strong> with automated response updates</li>\n" +
                "</ul>\n" +
                "<div class=\"button-container\">\n" +
                "  <a href=\"" + frontendUrl + "/billing\" class=\"button\">Upgrade to Premium</a>\n" +
                "</div>";
        return getHtmlLayout("Go Premium - Unlimited Outreach", body, getUnsubscribeUrl(user));
    }

    private String getDailyLimitExceededEmailTemplate(User user) {
        String body = "<p>Hi " + user.getName() + ",</p>\n" +
                "<p>You have hit your daily application outreach limit on the free tier.</p>\n" +
                "<p>Don't let your job search momentum slow down. Recruitment moves fast, and getting your profile in front of hiring managers first is key.</p>\n" +
                "<p>Upgrade to <strong>Auto Apply Pro Premium</strong> to get unlimited daily applications and keep applying today.</p>\n" +
                "<div class=\"button-container\">\n" +
                "  <a href=\"" + frontendUrl + "/billing\" class=\"button\">Unlock Unlimited Applications</a>\n" +
                "</div>";
        return getHtmlLayout("Daily Limit Reached", body, getUnsubscribeUrl(user));
    }

    private String getHtmlLayout(String title, String bodyContent, String unsubscribeUrl) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset=\"utf-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>" + title + "</title>\n" +
                "  <style>\n" +
                "    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }\n" +
                "    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0; }\n" +
                "    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; color: #ffffff; }\n" +
                "    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }\n" +
                "    .content { padding: 40px 30px; line-height: 1.6; font-size: 16px; }\n" +
                "    .content p { margin-top: 0; margin-bottom: 20px; }\n" +
                "    .content ul { padding-left: 20px; margin-bottom: 20px; }\n" +
                "    .content li { margin-bottom: 10px; }\n" +
                "    .button-container { text-align: center; margin: 30px 0; }\n" +
                "    .button { display: inline-block; padding: 14px 30px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1); transition: all 0.2s ease; }\n" +
                "    .footer { background-color: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }\n" +
                "    .footer p { margin: 5px 0; }\n" +
                "    .footer a { color: #4f46e5; text-decoration: underline; }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class=\"container\">\n" +
                "    <div class=\"header\">\n" +
                "      <h1>Auto Apply Pro</h1>\n" +
                "    </div>\n" +
                "    <div class=\"content\">\n" +
                "      " + bodyContent + "\n" +
                "    </div>\n" +
                "    <div class=\"footer\">\n" +
                "      <p>This email was sent to you because you signed up for Auto Apply Pro.</p>\n" +
                "      <p>Auto Apply Pro Inc., 123 Tech Boulevard, Suite 500, San Francisco, CA 94107</p>\n" +
                "      <p><a href=\"" + unsubscribeUrl + "\">Unsubscribe</a> | <a href=\"" + unsubscribeUrl.replace("unsubscribe", "profile") + "\">Manage Preferences</a></p>\n" +
                "    </div>\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
