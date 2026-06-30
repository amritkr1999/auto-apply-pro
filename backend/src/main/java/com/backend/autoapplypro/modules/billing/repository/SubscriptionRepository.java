package com.backend.autoapplypro.modules.billing.repository;

import com.backend.autoapplypro.modules.billing.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByRazorpaySubscriptionId(String razorpaySubscriptionId);
    List<Subscription> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Subscription> findTopByUserIdAndStatusInOrderByCreatedAtDesc(Long userId, List<String> statuses);
}
