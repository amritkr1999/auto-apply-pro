package com.backend.autoapplypro.config;

import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(3)
public class TrialMigrationRunner implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking for existing users to grant 15-day Elite Autopilot free trial...");
        List<User> users = userRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime trialEnd = now.plusDays(15);
        int grantedCount = 0;

        for (User user : users) {
            // Grant trial to candidate users who have not received a trial yet and do not have an explicit paid status
            if (user.getTrialEndAt() == null && !Boolean.TRUE.equals(user.getTrialUsed())) {
                if (!Boolean.TRUE.equals(user.getIsPremium()) && user.getRole() != UserRole.PRO && user.getRole() != UserRole.PREMIUM) {
                    user.setTrialStartAt(now);
                    user.setTrialEndAt(trialEnd);
                    user.setTrialTier("ELITE_AUTOPILOT");
                    user.setTrialUsed(true);
                    user.setDailyLimit(50);
                    userRepository.save(user);
                    grantedCount++;
                }
            }
        }

        if (grantedCount > 0) {
            log.info("Successfully granted 15-day Elite Autopilot trial to {} existing users.", grantedCount);
        } else {
            log.info("No existing users required trial migration.");
        }
    }
}
