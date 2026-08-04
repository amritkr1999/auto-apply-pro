package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserStatus;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DailyDigestScheduler {

    private final UserRepository userRepository;
    private final DailyDigestService dailyDigestService;

    /**
     * Hourly task checking for active users whose local time matches their configured EOD digest time.
     * Cron expression: "0 0 * * * *" runs at the beginning of every hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void processDailyEodDigests() {
        log.info("Starting hourly scan for Daily EOD Digest email dispatches...");

        List<User> activeUsers = userRepository.findByDailyDigestEnabledTrueAndStatus(UserStatus.ACTIVE);
        log.info("Found {} active users with Daily EOD Digest enabled", activeUsers.size());

        int dispatchedCount = 0;

        for (User user : activeUsers) {
            try {
                ZoneId userZone;
                try {
                    userZone = user.getOutreachTimezone() != null ? ZoneId.of(user.getOutreachTimezone()) : ZoneId.of("UTC");
                } catch (Exception e) {
                    log.warn("Invalid timezone '{}' for user ID {}, falling back to UTC", user.getOutreachTimezone(), user.getId());
                    userZone = ZoneId.of("UTC");
                }

                ZonedDateTime nowUserTime = ZonedDateTime.now(userZone);
                LocalDate todayInUserZone = nowUserTime.toLocalDate();
                LocalTime targetDigestTime = user.getDailyDigestTime() != null ? user.getDailyDigestTime() : LocalTime.of(20, 0);

                // Check if current hour in user's timezone matches target digest hour
                if (nowUserTime.getHour() == targetDigestTime.getHour()) {
                    // Check if digest hasn't already been sent for today
                    if (user.getLastDigestSentDate() == null || !user.getLastDigestSentDate().equals(todayInUserZone)) {
                        log.info("User ID {} ({}) matched EOD time (Hour {}) in timezone {}", 
                                user.getId(), user.getEmail(), targetDigestTime.getHour(), userZone);
                        
                        boolean success = dailyDigestService.sendDailyDigestForUser(user, todayInUserZone);
                        if (success) {
                            dispatchedCount++;
                        }
                    } else {
                        log.debug("User ID {} already received EOD digest for date {}", user.getId(), todayInUserZone);
                    }
                }
            } catch (Exception e) {
                log.error("Error processing EOD digest check for user ID {}", user.getId(), e);
            }
        }

        log.info("Finished Daily EOD Digest scan. Dispatched {} emails.", dispatchedCount);
    }
}
