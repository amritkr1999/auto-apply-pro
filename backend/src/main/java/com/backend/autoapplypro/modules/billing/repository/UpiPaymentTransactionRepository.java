package com.backend.autoapplypro.modules.billing.repository;

import com.backend.autoapplypro.modules.billing.model.UpiPaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UpiPaymentTransactionRepository extends JpaRepository<UpiPaymentTransaction, Long> {

    boolean existsByUtrNumber(String utrNumber);

    Optional<UpiPaymentTransaction> findByUtrNumber(String utrNumber);

    List<UpiPaymentTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<UpiPaymentTransaction> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
