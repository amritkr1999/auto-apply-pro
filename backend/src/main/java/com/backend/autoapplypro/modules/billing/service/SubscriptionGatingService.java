package com.backend.autoapplypro.modules.billing.service;

import com.backend.autoapplypro.modules.billing.repository.SubscriptionRepository;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionGatingService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    /**
     * Checks if a user has an active, authenticated, or pending premium subscription,
     * or if user.isPremium is true / user role is PRO or PREMIUM.
     *
     * @param userId the user ID to check
     * @return true if the user is premium, false otherwise
     */
    public boolean isPremiumUser(Long userId) {
        if (userId == null) {
            return false;
        }
        boolean hasDirectPremium = userRepository.findById(userId)
                .map(u -> Boolean.TRUE.equals(u.getIsPremium()) || u.getRole() == UserRole.PRO || u.getRole() == UserRole.PREMIUM || u.isTrialActive())
                .orElse(false);
        if (hasDirectPremium) {
            return true;
        }
        return subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                userId, List.of("active", "authenticated", "pending")
        ).isPresent();
    }

    /**
     * Validates premium access for a user. Throws an IllegalArgumentException if the user
     * does not have premium status.
     *
     * @param userId the user ID to check
     * @throws IllegalArgumentException if the user is not premium
     */
    public void validatePremiumAccess(Long userId) {
        if (!isPremiumUser(userId)) {
            log.warn("Access denied: User ID {} attempted to access premium feature without active subscription.", userId);
            throw new IllegalArgumentException("Upgrade to Premium for multiple template use.");
        }
    }
}
