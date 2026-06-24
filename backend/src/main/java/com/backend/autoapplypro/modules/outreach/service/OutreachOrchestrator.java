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

    /**
     * Strictly server-side scheduler (cron job) running every 5 minutes.
     * Pulls PENDING drafts from the queue, enforces user daily send limits,
     * dispatches email using the connected sender, and handles anti-spam/rejection errors.
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void processOutreachQueue() {
        log.info("Starting scheduled outreach queue processing run.");
        
        List<EmailQueue> pendingEmails = queueRepository.findByStatus(OutreachStatus.PENDING);
        if (pendingEmails.isEmpty()) {
            log.info("No pending outreach emails found in the queue.");
            return;
        }

        log.info("Found {} pending outreach emails to process.", pendingEmails.size());

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

            // 2. Dispatch
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
                
                // 3. Anti-Spam Rejection Handling
                switch (e.getErrorType()) {
                    case INVALID_RECIPIENT:
                        // 550 Analogous error -> Blacklist address
                        log.warn("BLACKLIST TRIGGERED: Recipient {} is invalid. Blacklisting entry in queue.", item.getRecipientEmail());
                        item.setStatus(OutreachStatus.BLACKLISTED);
                        break;
                    case RATE_LIMITED:
                        // 429 Analogous error -> Pause sending
                        log.warn("RATE LIMIT TRIGGERED: Platform sending paused for user ID: {}.", user.getId());
                        item.setStatus(OutreachStatus.PAUSED);
                        break;
                    case UNAUTHORIZED:
                        // OAuth Revoked -> Pause sending
                        log.warn("CREDENTIAL ERROR: Gmail connection invalid for user ID: {}. Pausing send.", user.getId());
                        item.setStatus(OutreachStatus.PAUSED);
                        break;
                    default:
                        // Generic error -> Mark as failed
                        item.setStatus(OutreachStatus.FAILED);
                        break;
                }
                queueRepository.save(item);
            }
        }
        log.info("Finished outreach queue processing run.");
    }
}
