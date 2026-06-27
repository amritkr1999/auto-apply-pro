package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutreachSchedulerService {

    private final EmailQueueRepository queueRepository;

    /**
     * Calculates the next scheduled send time for a new email, chaining it after
     * any existing future scheduled emails for this user.
     */
    public LocalDateTime calculateNextScheduleTime(User user) {
        LocalDateTime baseTime = LocalDateTime.now();
        
        // Find latest scheduled email for the user
        Optional<EmailQueue> latestScheduled = queueRepository.findFirstByUserIdAndScheduledAtIsNotNullOrderByScheduledAtDesc(user.getId());
        
        int minInterval = user.getOutreachMinIntervalMin() != null ? user.getOutreachMinIntervalMin() : 10;
        int maxInterval = user.getOutreachMaxIntervalMin() != null ? user.getOutreachMaxIntervalMin() : 30;
        
        if (latestScheduled.isPresent()) {
            LocalDateTime lastTime = latestScheduled.get().getScheduledAt();
            if (lastTime.isAfter(baseTime)) {
                // Chain after the last scheduled email
                baseTime = lastTime;
                int randomMinutes = minInterval + new Random().nextInt(Math.max(1, maxInterval - minInterval + 1));
                LocalDateTime candidateTime = baseTime.plusMinutes(randomMinutes);
                log.info("Chaining email draft scheduling. Last scheduled time: {}, next candidate time: {}", lastTime, candidateTime);
                return adjustForTimeSlotAndWeekends(candidateTime, user);
            } else {
                // Last scheduled is in the past. Check if it was sent recently.
                if (baseTime.isBefore(lastTime.plusMinutes(minInterval))) {
                    baseTime = lastTime;
                    int randomMinutes = minInterval + new Random().nextInt(Math.max(1, maxInterval - minInterval + 1));
                    LocalDateTime candidateTime = baseTime.plusMinutes(randomMinutes);
                    log.info("Enforcing min interval since last scheduled time. Last scheduled time: {}, next candidate time: {}", lastTime, candidateTime);
                    return adjustForTimeSlotAndWeekends(candidateTime, user);
                }
            }
        }
        
        // First email or no recent emails, schedule with a tiny random jitter (e.g. 1 to 5 mins)
        int initialJitter = 1 + new Random().nextInt(5);
        LocalDateTime candidateTime = baseTime.plusMinutes(initialJitter);
        log.info("Scheduling first/fresh email draft. Jitter offset: {} mins, candidate time: {}", initialJitter, candidateTime);
        return adjustForTimeSlotAndWeekends(candidateTime, user);
    }

    /**
     * Reschedules all pending emails for a user sequentially based on current settings.
     */
    public void reschedulePendingEmails(User user) {
        List<EmailQueue> userEmails = queueRepository.findByUserId(user.getId());
        // Filter to PENDING status and order by id (chronological order of queuing)
        List<EmailQueue> sortedPending = userEmails.stream()
                .filter(e -> e.getStatus() == OutreachStatus.PENDING)
                .sorted(Comparator.comparing(EmailQueue::getId))
                .toList();
                
        if (sortedPending.isEmpty()) {
            log.info("No pending emails found to reschedule for user ID: {}", user.getId());
            return;
        }

        log.info("Rescheduling {} pending emails for user ID: {}", sortedPending.size(), user.getId());
        LocalDateTime baseTime = LocalDateTime.now();
        // Check if there was a recently sent email to respect the minInterval
        Optional<EmailQueue> lastSent = userEmails.stream()
                .filter(e -> e.getStatus() == OutreachStatus.SENT && e.getScheduledAt() != null)
                .max(Comparator.comparing(EmailQueue::getScheduledAt));
                
        int minInterval = user.getOutreachMinIntervalMin() != null ? user.getOutreachMinIntervalMin() : 10;
        int maxInterval = user.getOutreachMaxIntervalMin() != null ? user.getOutreachMaxIntervalMin() : 30;
        
        if (lastSent.isPresent()) {
            LocalDateTime lastTime = lastSent.get().getScheduledAt();
            if (baseTime.isBefore(lastTime.plusMinutes(minInterval))) {
                baseTime = lastTime;
                log.info("Rescheduling start point adjusted to last sent scheduledAt: {}", lastTime);
            }
        }

        // Reschedule each sequentially
        boolean isFirst = true;
        for (EmailQueue email : sortedPending) {
            LocalDateTime candidateTime;
            if (isFirst && baseTime.isEqual(LocalDateTime.now())) {
                // If starting fresh from now, apply a tiny initial jitter
                candidateTime = baseTime.plusMinutes(1 + new Random().nextInt(5));
                isFirst = false;
            } else {
                int randomMinutes = minInterval + new Random().nextInt(Math.max(1, maxInterval - minInterval + 1));
                candidateTime = baseTime.plusMinutes(randomMinutes);
            }
            
            LocalDateTime scheduledTime = adjustForTimeSlotAndWeekends(candidateTime, user);
            email.setScheduledAt(scheduledTime);
            queueRepository.save(email);
            
            // The next email will chain after this newly scheduled time
            baseTime = scheduledTime;
            log.info("Rescheduled email ID {} to {}", email.getId(), scheduledTime);
        }
    }

    private LocalDateTime adjustForTimeSlotAndWeekends(LocalDateTime candidateTime, User user) {
        String tzId = user.getOutreachTimezone() != null ? user.getOutreachTimezone() : "UTC";
        ZoneId userZone = ZoneId.of(tzId);
        
        ZonedDateTime serverZdt = candidateTime.atZone(ZoneId.systemDefault());
        ZonedDateTime userZdt = serverZdt.withZoneSameInstant(userZone);
        
        LocalTime slotStart = user.getOutreachSlotStart() != null ? user.getOutreachSlotStart() : LocalTime.of(9, 0);
        LocalTime slotEnd = user.getOutreachSlotEnd() != null ? user.getOutreachSlotEnd() : LocalTime.of(17, 0);
        boolean skipWeekends = user.getOutreachSkipWeekends() != null ? user.getOutreachSkipWeekends() : true;
        
        boolean adjusted = true;
        int loops = 0;
        while (adjusted && loops < 10) {
            adjusted = false;
            
            // 1. Weekend check
            if (skipWeekends) {
                DayOfWeek day = userZdt.getDayOfWeek();
                if (day == DayOfWeek.SATURDAY) {
                    userZdt = userZdt.plusDays(2).with(LocalTime.MIDNIGHT);
                    adjusted = true;
                    continue;
                } else if (day == DayOfWeek.SUNDAY) {
                    userZdt = userZdt.plusDays(1).with(LocalTime.MIDNIGHT);
                    adjusted = true;
                    continue;
                }
            }
            
            // 2. Time slot check
            LocalTime time = userZdt.toLocalTime();
            if (time.isBefore(slotStart)) {
                int jitter = new Random().nextInt(10);
                userZdt = userZdt.with(slotStart).plusMinutes(jitter);
                adjusted = true;
            } else if (time.isAfter(slotEnd)) {
                int jitter = new Random().nextInt(10);
                userZdt = userZdt.plusDays(1).with(slotStart).plusMinutes(jitter);
                adjusted = true;
            }
            
            loops++;
        }
        
        LocalDateTime finalServerTime = userZdt.withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
        log.info("Time adjusted for slot constraints. Input (Server Time): {}, Output (Server Time): {}, User local: {}", 
                candidateTime, finalServerTime, userZdt);
        return finalServerTime;
    }
}
