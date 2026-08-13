package com.backend.autoapplypro.config;

import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(3)
public class TrialMigrationRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Ensure trial columns exist on users table for existing databases
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_start_at TIMESTAMP WITHOUT TIME ZONE");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end_at TIMESTAMP WITHOUT TIME ZONE");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_tier VARCHAR(255) DEFAULT 'ELITE_AUTOPILOT'");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_warning_sent BOOLEAN DEFAULT FALSE");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_expired_sent BOOLEAN DEFAULT FALSE");
                log.info("Successfully checked and initialized trial columns on users table.");
            } catch (Exception ex) {
                log.warn("Could not check/update trial columns on users table", ex);
            }

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
        } catch (Exception e) {
            log.error("Error executing TrialMigrationRunner", e);
        }
    }
}
