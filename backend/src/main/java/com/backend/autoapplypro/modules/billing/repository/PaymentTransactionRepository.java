package com.backend.autoapplypro.modules.billing.repository;

import com.backend.autoapplypro.modules.billing.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findByRazorpayPaymentId(String razorpayPaymentId);
    List<PaymentTransaction> findBySubscriptionIdOrderByCreatedAtDesc(Long subscriptionId);
}
