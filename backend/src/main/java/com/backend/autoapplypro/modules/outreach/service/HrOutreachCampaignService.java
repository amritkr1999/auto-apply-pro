package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.hr.HrDetails;
import com.backend.autoapplypro.modules.hr.HrRepository;
import com.backend.autoapplypro.modules.billing.service.SubscriptionGatingService;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.testingemails.TestingEmail;
import com.backend.autoapplypro.testingemails.TestingEmailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HrOutreachCampaignService {

    private final UserRepository userRepository;
    private final EmailQueueRepository queueRepository;
    private final EmailTemplateRepository templateRepository;
    private final TestingEmailRepository testingEmailRepository;
    private final HrRepository hrRepository;
    private final OutreachSchedulerService schedulerService;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final SubscriptionGatingService subscriptionGatingService;
    private final GmailEmailSender gmailEmailSender;

    @Transactional
    public void toggleCampaign(User user, boolean enable, String targetRole, String templateId, String sourceTable) {
        log.info("Toggling HR Outreach Campaign for user ID: {}. Enable: {}, Target Role: {}, Template ID: {}, Source Table: {}",
                user.getId(), enable, targetRole, templateId, sourceTable);

        // Allowed for all users. Premium limits apply to multiple template/profile creations and variations.

        // Always update user configuration fields
        user.setHrOutreachTargetRole(targetRole != null ? targetRole : "Software Engineer");
        user.setHrOutreachTemplateId(templateId != null ? templateId : "default-1");
        user.setHrOutreachSourceTable(sourceTable != null ? sourceTable : "MAIN");

        boolean oldStatus = Boolean.TRUE.equals(user.getHrOutreachCampaignEnabled());
        user.setHrOutreachCampaignEnabled(enable);
        userRepository.save(user);

        if (oldStatus && !enable) {
            // Deactivate: cancel any pending or paused campaign emails
            deactivateCampaign(user);
        } else if (!oldStatus && enable) {
            // Activate: generate campaign emails
            activateCampaign(user);
        } else if (enable) {
            // If already enabled, but settings changed, we should regenerate the pending/paused ones to match the new templates/settings
            deactivateCampaign(user);
            activateCampaign(user);
        }
    }

    private void deactivateCampaign(User user) {
        log.info("Deactivating campaign for user ID: {}. Removing pending campaign emails from queue.", user.getId());
        List<EmailQueue> campaignEmails = queueRepository.findByUserId(user.getId()).stream()
                .filter(e -> Boolean.TRUE.equals(e.getIsCampaign()) && 
                        (e.getStatus() == OutreachStatus.PENDING || e.getStatus() == OutreachStatus.PAUSED))
                .toList();

        if (!campaignEmails.isEmpty()) {
            queueRepository.deleteAll(campaignEmails);
            log.info("Removed {} pending/paused campaign emails for user ID: {}", campaignEmails.size(), user.getId());
        }
    }

    private void activateCampaign(User user) {
        log.info("Activating campaign for user ID: {}. Queueing first campaign email.", user.getId());
        queueNextCampaignEmail(user);
    }

    @Transactional
    public void queueNextCampaignEmail(User user) {
        log.info("Attempting to queue next campaign email for user ID: {}", user.getId());
        
        String sourceTable = user.getHrOutreachSourceTable() != null ? user.getHrOutreachSourceTable() : "MAIN";
        String templateId = user.getHrOutreachTemplateId() != null ? user.getHrOutreachTemplateId() : "default-1";
        String targetRole = user.getHrOutreachTargetRole() != null ? user.getHrOutreachTargetRole() : "Software Engineer";

        // Fetch template
        EmailTemplate template = templateRepository.findById(templateId)
                .orElseGet(() -> {
                    log.warn("Template ID {} not found. Falling back to default-1.", templateId);
                    return templateRepository.findById("default-1")
                            .orElseGet(() -> EmailTemplate.builder()
                                    .id("default-1")
                                    .name("General Application Outreach")
                                    .subject("Application for {{jobRole}} | {{hrName}}")
                                    .body("Hi {{hrName}},<br/><br/>I hope you are doing well.<br/><br/>I am reaching out to express my interest in the <strong>{{jobRole}}</strong> position at <strong>{{companyName}}</strong>.<br/><br/>Best regards,<br/>" + user.getName())
                                    .build());
                });

        // 1. Gather all potential targets from the selected table
        List<RecipientInfo> recipients = new ArrayList<>();
        if ("TESTING".equalsIgnoreCase(sourceTable)) {
            List<TestingEmail> testList = testingEmailRepository.findAll();
            for (TestingEmail t : testList) {
                if (t.getEmail() != null && !t.getEmail().trim().isEmpty()) {
                    recipients.add(new RecipientInfo(t.getName(), t.getEmail(), t.getCompanyName()));
                }
            }
        } else {
            // Default to MAIN (hr_details) table
            List<HrDetails> hrList = hrRepository.findAll();
            for (HrDetails hr : hrList) {
                if (hr.getEmail() != null && !hr.getEmail().trim().isEmpty()) {
                    recipients.add(new RecipientInfo(hr.getName(), hr.getEmail(), hr.getCompanyName()));
                }
            }
        }

        if (recipients.isEmpty()) {
            log.warn("No recipient emails found in source table: {}", sourceTable);
            return;
        }

        // 2. Filter out already emailed/queued emails for this user
        List<EmailQueue> userEmails = queueRepository.findByUserId(user.getId());
        Set<String> processedEmails = new HashSet<>();
        for (EmailQueue eq : userEmails) {
            processedEmails.add(eq.getRecipientEmail().toLowerCase().trim());
        }

        List<String> excludedCompanies = professionalProfileRepository.findByUserId(user.getId())
                .map(ProfessionalProfile::getExcludedCompanies)
                .orElse(null);

        List<RecipientInfo> remainingRecipients = recipients.stream()
                .filter(r -> !processedEmails.contains(r.email.toLowerCase().trim()))
                .filter(r -> {
                    if (excludedCompanies == null || excludedCompanies.isEmpty() || r.companyName == null) {
                        return true;
                    }
                    return excludedCompanies.stream().noneMatch(c -> c.trim().equalsIgnoreCase(r.companyName.trim()));
                })
                .toList();

        if (remainingRecipients.isEmpty()) {
            log.info("All recipients from table {} have already been processed for user ID: {}", sourceTable, user.getId());
            return;
        }

        // Shuffle remaining to pick a random one
        List<RecipientInfo> shuffledRecipients = new ArrayList<>(remainingRecipients);
        Collections.shuffle(shuffledRecipients);
        RecipientInfo recipient = shuffledRecipients.get(0);

        String subject = substitutePlaceholders(template.getSubject(), recipient, targetRole);
        String body = substitutePlaceholders(template.getBody(), recipient, targetRole);

        // Compute next schedule time
        java.time.LocalDateTime scheduledAt = schedulerService.calculateNextScheduleTime(user);

        String dispatchMode = user.getHrOutreachDispatchMode() != null ? user.getHrOutreachDispatchMode() : "DIRECT_SEND";
        OutreachStatus status = OutreachStatus.PENDING;

        if ("GMAIL_DRAFTS".equalsIgnoreCase(dispatchMode) || "DRAFTS".equalsIgnoreCase(dispatchMode)) {
            status = OutreachStatus.DRAFT;
            try {
                gmailEmailSender.createDraft(user.getId(), recipient.email, null, subject, body);
                log.info("Automatically created Gmail draft for campaign recipient: {}", recipient.email);
            } catch (Exception e) {
                log.warn("Automatic Gmail draft creation failed for user ID: {}. Storing as local draft queue item fallback.", user.getId(), e);
            }
        } else if ("GMAIL_COMPOSE".equalsIgnoreCase(dispatchMode) || "WEB_COMPOSE".equalsIgnoreCase(dispatchMode)) {
            status = OutreachStatus.DRAFT;
        }

        EmailQueue queueItem = EmailQueue.builder()
                .user(user)
                .recipientEmail(recipient.email)
                .subject(subject)
                .body(body)
                .status(status)
                .isCampaign(true)
                .scheduledAt(scheduledAt)
                .build();

        queueRepository.save(queueItem);
        log.info("Successfully queued campaign email ID: {} (Status: {}, Mode: {}) to: {} for user ID: {}", 
                queueItem.getId(), status, dispatchMode, recipient.email, user.getId());
    }

    private String substitutePlaceholders(String text, RecipientInfo recipient, String targetRole) {
        if (text == null) return "";
        return text
                .replace("{{hrName}}", recipient.name != null ? recipient.name : "")
                .replace("{{companyName}}", recipient.companyName != null ? recipient.companyName : "")
                .replace("{{jobRole}}", targetRole != null ? targetRole : "");
    }

    @Transactional
    public void deleteContactFromLists(String email) {
        log.info("Permanently removing invalid email address from contact lists: {}", email);
        try {
            hrRepository.deleteByEmailIgnoreCase(email);
            testingEmailRepository.deleteByEmailIgnoreCase(email);
        } catch (Exception e) {
            log.error("Failed to delete contact with email: {} from lists", email, e);
        }
    }

    private static class RecipientInfo {
        String name;
        String email;
        String companyName;

        RecipientInfo(String name, String email, String companyName) {
            this.name = name;
            this.email = email;
            this.companyName = companyName;
        }
    }
}
