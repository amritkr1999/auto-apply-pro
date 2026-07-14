package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.outreach.exception.OutreachSendException;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserActivityLog;
import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.repository.UserActivityLogRepository;
import com.backend.autoapplypro.modules.jobs.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@EnableScheduling
public class OutreachOrchestrator {

    private final EmailQueueRepository queueRepository;
    private final UserRepository userRepository;
    private final EmailSender emailSender; // Automatically wires GmailEmailSender implementation
    private final OutreachSchedulerService schedulerService;
    private final HrOutreachCampaignService campaignService;
    private final UserActivityLogRepository userActivityLogRepository;
    private final JobApplicationService jobApplicationService;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final com.backend.autoapplypro.modules.users.service.MarketingEmailCampaignService marketingCampaignService;

    /**
     * Strictly server-side scheduler (cron job) running every 5 minutes.
     * Pulls PENDING drafts from the queue, enforces user daily send limits,
     * dispatches email using the connected sender, and handles anti-spam/rejection errors.
     */
    /**
     * Strictly server-side scheduler (cron job) running every minute.
     * Pulls PENDING drafts that are due from the queue, checks time slots,
     * enforces daily send limits, spacing guardrails, and sends them.
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void processOutreachQueue() {
        log.info("Starting scheduled outreach queue processing run.");
        
        List<EmailQueue> pendingEmails = queueRepository.findDueEmailsForUpdate(OutreachStatus.PENDING, LocalDateTime.now());
        if (pendingEmails.isEmpty()) {
            log.info("No due pending outreach emails found in the queue.");
            return;
        }

        log.info("Found {} due pending outreach emails to process.", pendingEmails.size());

        for (EmailQueue item : pendingEmails) {
            User user = item.getUser();
            
            // 1. Reset daily limits check if needed
            LocalDate today = LocalDate.now();
            if (user.getLastSentReset() == null || !user.getLastSentReset().equals(today)) {
                log.info("Resetting daily send counter for user ID: {} (previous reset date: {})", 
                        user.getId(), user.getLastSentReset());
                user.setSentToday(0);
                user.setLastSentReset(today);
                userRepository.save(user);

                // Auto-resume emails paused due to daily limits
                List<EmailQueue> pausedEmails = queueRepository.findByUserIdAndStatus(user.getId(), OutreachStatus.PAUSED);
                for (EmailQueue paused : pausedEmails) {
                    if (paused.getErrorMessage() != null && paused.getErrorMessage().contains("Daily outreach send limit reached")) {
                        log.info("Quota reset: Resuming paused email ID: {} for user ID: {}", paused.getId(), user.getId());
                        paused.setStatus(OutreachStatus.PENDING);
                        paused.setErrorMessage(null);
                        paused.setScheduledAt(schedulerService.calculateNextScheduleTime(user));
                        queueRepository.save(paused);
                    }
                }
            }

            int sentToday = user.getSentToday() != null ? user.getSentToday() : 0;
            int dailyLimit = user.getDailyLimit() != null ? user.getDailyLimit() : 50;

            // Enforce daily limits
            if (sentToday >= dailyLimit) {
                log.warn("ANTI-SPAM SHIELD: User ID {} has hit their daily sending limit of {} emails/day. Pausing send.", 
                        user.getId(), dailyLimit);
                item.setStatus(OutreachStatus.PAUSED);
                item.setErrorMessage("Daily outreach send limit reached. Paused until next quota reset.");
                queueRepository.save(item);
                marketingCampaignService.sendDailyLimitExceededEmail(user.getId());
                continue;
            }

            // 2. Active Hours and Weekend restriction check
            String tzId = user.getOutreachTimezone() != null ? user.getOutreachTimezone() : "UTC";
            java.time.ZoneId userZone = java.time.ZoneId.of(tzId);
            java.time.ZonedDateTime userNow = java.time.ZonedDateTime.now(userZone);

            // Weekend check
            if (Boolean.TRUE.equals(user.getOutreachSkipWeekends())) {
                java.time.DayOfWeek day = userNow.getDayOfWeek();
                if (day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY) {
                    log.info("Skipping outreach for user ID {} - weekend restriction active in timezone {}.", user.getId(), tzId);
                    continue;
                }
            }

            // Time slot check
            java.time.LocalTime localTime = userNow.toLocalTime();
            java.time.LocalTime slotStart = user.getOutreachSlotStart() != null ? user.getOutreachSlotStart() : java.time.LocalTime.of(9, 0);
            java.time.LocalTime slotEnd = user.getOutreachSlotEnd() != null ? user.getOutreachSlotEnd() : java.time.LocalTime.of(17, 0);
            if (localTime.isBefore(slotStart) || localTime.isAfter(slotEnd)) {
                log.info("Skipping outreach for user ID {} - outside configured active hours ({} to {}) in timezone {}. Local time: {}", 
                        user.getId(), slotStart, slotEnd, tzId, localTime);
                continue;
            }

            // 3. Spacing Safety Guardrail Check
            int minInterval = user.getOutreachMinIntervalMin() != null ? user.getOutreachMinIntervalMin() : 10;
            LocalDateTime lastSentThreshold = LocalDateTime.now().minusMinutes(minInterval);
            boolean hasSentRecently = queueRepository.existsByUserIdAndStatusAndSentAtAfter(user.getId(), OutreachStatus.SENT, lastSentThreshold);
            if (hasSentRecently) {
                log.info("Safety guardrail active: Skipping email queue ID: {} for user ID: {} because another email was sent within the last {} minutes.", 
                        item.getId(), user.getId(), minInterval);
                continue;
            }

            // Excluded Companies Check
            boolean isExcludedCompany = false;
            java.util.Optional<ProfessionalProfile> candidateOpt = professionalProfileRepository.findByUserId(user.getId());
            if (candidateOpt.isPresent()) {
                List<String> excluded = candidateOpt.get().getExcludedCompanies();
                if (excluded != null && !excluded.isEmpty()) {
                    String recipient = item.getRecipientEmail().toLowerCase().trim();
                    for (String company : excluded) {
                        String cleanCompany = company.trim().toLowerCase();
                        if (cleanCompany.isEmpty()) continue;
                        
                        if (recipient.contains("@")) {
                            String domain = recipient.substring(recipient.indexOf("@") + 1);
                            if (domain.startsWith(cleanCompany + ".") || domain.contains("." + cleanCompany + ".")) {
                                isExcludedCompany = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (isExcludedCompany) {
                log.warn("EXCLUDED COMPANY SHIELD: Recipient {} belongs to excluded company. Blacklisting queue item.", item.getRecipientEmail());
                item.setStatus(OutreachStatus.BLACKLISTED);
                item.setErrorMessage("Company matches the candidate's excluded company list.");
                queueRepository.save(item);
                continue;
            }

            // 4. Dispatch
            try {
                emailSender.sendEmail(user.getId(), item.getRecipientEmail(), item.getCcEmails(), item.getSubject(), item.getBody());
                
                // Success updates
                item.setStatus(OutreachStatus.SENT);
                item.setSentAt(LocalDateTime.now());
                item.setErrorMessage(null);
                queueRepository.save(item);

                // Increment sent counter
                user.setSentToday(sentToday + 1);
                userRepository.save(user);

                // Trigger limit warning if they just hit the quota
                if (user.getSentToday() >= user.getDailyLimit()) {
                    marketingCampaignService.sendDailyLimitExceededEmail(user.getId());
                }

                // Save EMAIL_SENT activity log
                userActivityLogRepository.save(UserActivityLog.builder()
                        .user(user)
                        .activityType("EMAIL_SENT")
                        .activityDate(LocalDate.now())
                        .referenceId(item.getId())
                        .build());
                
                // Auto-log to Job Application CRM
                jobApplicationService.createApplicationFromOutreach(user, item.getRecipientEmail(), item.getSubject());
                
                log.info("Successfully sent email queue ID: {} for user ID: {}. Daily send progress: {}/{}", 
                        item.getId(), user.getId(), user.getSentToday(), user.getDailyLimit());

            } catch (OutreachSendException e) {
                log.error("OutreachSendException occurred for queue ID: {}. Error Type: {}, Message: {}", 
                        item.getId(), e.getErrorType(), e.getMessage());
                
                item.setErrorMessage(e.getMessage());
                
                // 5. Anti-Spam Rejection Handling
                switch (e.getErrorType()) {
                    case INVALID_RECIPIENT:
                        log.warn("BLACKLIST TRIGGERED: Recipient {} is invalid. Blacklisting entry in queue and cleaning from contact lists.", item.getRecipientEmail());
                        item.setStatus(OutreachStatus.BLACKLISTED);
                        campaignService.deleteContactFromLists(item.getRecipientEmail());
                        break;
                    case RATE_LIMITED:
                        log.warn("RATE LIMIT TRIGGERED: Platform sending paused for user ID: {}.", user.getId());
                        item.setStatus(OutreachStatus.PAUSED);
                        break;
                    case UNAUTHORIZED:
                        log.warn("CREDENTIAL ERROR: Gmail connection invalid for user ID: {}. Pausing send.", user.getId());
                        item.setStatus(OutreachStatus.PAUSED);
                        break;
                    default:
                        item.setStatus(OutreachStatus.FAILED);
                        break;
                }
                queueRepository.save(item);
            }

            // 6. JIT Campaign Queue Chaining: If the sent email was a campaign email and has completed execution,
            // check if we need to schedule the next contact.
            if (Boolean.TRUE.equals(item.getIsCampaign()) && Boolean.TRUE.equals(user.getHrOutreachCampaignEnabled())) {
                if (item.getStatus() == OutreachStatus.SENT || 
                    item.getStatus() == OutreachStatus.BLACKLISTED || 
                    item.getStatus() == OutreachStatus.FAILED) {
                    
                    // Safety check: ensure no other campaign emails are currently pending or paused for this user
                    boolean hasPendingCampaign = queueRepository.findByUserId(user.getId()).stream()
                            .anyMatch(e -> Boolean.TRUE.equals(e.getIsCampaign()) && 
                                    (e.getStatus() == OutreachStatus.PENDING || e.getStatus() == OutreachStatus.PAUSED));
                    if (!hasPendingCampaign) {
                        campaignService.queueNextCampaignEmail(user);
                    }
                }
            }
        }
        log.info("Finished outreach queue processing run.");
    }
}
