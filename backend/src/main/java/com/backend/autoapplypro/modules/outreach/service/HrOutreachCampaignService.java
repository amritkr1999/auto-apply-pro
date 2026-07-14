package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.hr.HrDetails;
import com.backend.autoapplypro.modules.hr.HrRepository;
import com.backend.autoapplypro.modules.billing.service.SubscriptionGatingService;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import com.backend.autoapplypro.modules.users.model.Candidate;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.CandidateRepository;
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
    private final CandidateRepository candidateRepository;
    private final SubscriptionGatingService subscriptionGatingService;

    @Transactional
    public void toggleCampaign(User user, boolean enable, String targetRole, String templateId, String sourceTable) {
        log.info("Toggling HR Outreach Campaign for user ID: {}. Enable: {}, Target Role: {}, Template ID: {}, Source Table: {}",
                user.getId(), enable, targetRole, templateId, sourceTable);

        if (enable) {
            subscriptionGatingService.validatePremiumAccess(user.getId());
        }

        // Always update user configuration fields
        user.setHrOutreachTargetRole(targetRole != null ? targetRole : "Software Engineer");
        user.setHrOutreachTemplateId(templateId != null ? templateId : "default-1");
        user.setHrOutreachSourceTable(sourceTable != null ? sourceTable : "TESTING");

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
        
        String sourceTable = user.getHrOutreachSourceTable() != null ? user.getHrOutreachSourceTable() : "TESTING";
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
        if ("MAIN".equalsIgnoreCase(sourceTable)) {
            List<HrDetails> hrList = hrRepository.findAll();
            for (HrDetails hr : hrList) {
                if (hr.getEmail() != null && !hr.getEmail().trim().isEmpty()) {
                    recipients.add(new RecipientInfo(hr.getName(), hr.getEmail(), hr.getCompanyName()));
                }
            }
        } else {
            // Default to TESTING table
            List<TestingEmail> testList = testingEmailRepository.findAll();
            for (TestingEmail t : testList) {
                if (t.getEmail() != null && !t.getEmail().trim().isEmpty()) {
                    recipients.add(new RecipientInfo(t.getName(), t.getEmail(), t.getCompanyName()));
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

        List<String> excludedCompanies = candidateRepository.findByUserId(user.getId())
                .map(Candidate::getExcludedCompanies)
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

        EmailQueue queueItem = EmailQueue.builder()
                .user(user)
                .recipientEmail(recipient.email)
                .subject(subject)
                .body(body)
                .status(OutreachStatus.PENDING)
                .isCampaign(true)
                .scheduledAt(scheduledAt)
                .build();

        queueRepository.save(queueItem);
        log.info("Successfully queued single campaign email ID: {} to: {} for user ID: {}", queueItem.getId(), recipient.email, user.getId());
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
