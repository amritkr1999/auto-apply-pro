package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.outreach.exception.OutreachSendException;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
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
        
        List<EmailQueue> pendingEmails = queueRepository.findDueEmails(OutreachStatus.PENDING, LocalDateTime.now());
        if (pendingEmails.isEmpty()) {
            log.info("No due pending outreach emails found in the queue.");
            return;
        }

        log.info("Found {} due pending outreach emails to process.", pendingEmails.size());

        for (EmailQueue item : pendingEmails) {
            User user = item.getUser();
            
            // 1. Throttling Check: Reset count if date has changed
            LocalDate today = LocalDate.now();
            if (user.getLastSentReset() == null || !user.getLastSentReset().isEqual(today)) {
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

            // 4. Dispatch
            try {
                emailSender.sendEmail(user.getId(), item.getRecipientEmail(), item.getSubject(), item.getBody());
                
                // Success updates
                item.setStatus(OutreachStatus.SENT);
                item.setSentAt(LocalDateTime.now());
                item.setErrorMessage(null);
                queueRepository.save(item);

                // Increment sent counter
                user.setSentToday(sentToday + 1);
                userRepository.save(user);
                
                log.info("Successfully sent email queue ID: {} for user ID: {}. Daily send progress: {}/{}", 
                        item.getId(), user.getId(), user.getSentToday(), user.getDailyLimit());

            } catch (OutreachSendException e) {
                log.error("OutreachSendException occurred for queue ID: {}. Error Type: {}, Message: {}", 
                        item.getId(), e.getErrorType(), e.getMessage());
                
                item.setErrorMessage(e.getMessage());
                
                // 5. Anti-Spam Rejection Handling
                switch (e.getErrorType()) {
                    case INVALID_RECIPIENT:
                        log.warn("BLACKLIST TRIGGERED: Recipient {} is invalid. Blacklisting entry in queue.", item.getRecipientEmail());
                        item.setStatus(OutreachStatus.BLACKLISTED);
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
        }
        log.info("Finished outreach queue processing run.");
    }
}
