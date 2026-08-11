package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.billing.repository.SubscriptionRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrialNotificationScheduler {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SystemEmailService systemEmailService;

    /**
     * Periodically checks for trials that are ending in <= 3 days (sends warning email)
     * and trials that have expired (resets daily limit to 15, sends expired email).
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void processTrialExpirationsAndNotifications() {
        log.info("Running scheduled trial status & notification check...");
        List<User> users = userRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        for (User user : users) {
            // Ignore users with active paid subscriptions
            boolean hasActiveSub = Boolean.TRUE.equals(user.getIsPremium())
                    || user.getRole() == UserRole.PRO
                    || user.getRole() == UserRole.PREMIUM
                    || subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                    user.getId(), List.of("active", "authenticated", "pending")).isPresent();

            if (hasActiveSub || user.getTrialEndAt() == null) {
                continue;
            }

            // 1. Check for trial ending warning (<= 3 days remaining)
            if (user.isTrialActive()) {
                long daysLeft = user.getTrialDaysRemaining();
                if (daysLeft <= 3 && !Boolean.TRUE.equals(user.getTrialWarningSent())) {
                    log.info("Sending trial warning email to user ID: {}, Email: {}, Days Left: {}", user.getId(), user.getEmail(), daysLeft);
                    systemEmailService.sendTrialWarningEmail(user.getEmail(), user.getName(), daysLeft);
                    user.setTrialWarningSent(true);
                    userRepository.save(user);
                }
            } else {
                // 2. Trial expired and user does not have a paid subscription
                if (!Boolean.TRUE.equals(user.getTrialExpiredSent())) {
                    log.info("Trial expired for user ID: {}, Email: {}. Transitioning to Free Tier (15 apps/day limit).", user.getId(), user.getEmail());
                    user.setDailyLimit(15); // Fallback to Free Tier daily limit
                    user.setTrialExpiredSent(true);
                    userRepository.save(user);
                    systemEmailService.sendTrialExpiredEmail(user.getEmail(), user.getName());
                }
            }
        }
    }
}
