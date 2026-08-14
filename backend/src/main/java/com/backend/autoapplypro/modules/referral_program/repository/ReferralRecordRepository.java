package com.backend.autoapplypro.modules.referral_program.repository;

import com.backend.autoapplypro.modules.referral_program.model.ReferralRecord;
import com.backend.autoapplypro.modules.referral_program.model.ReferralStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReferralRecordRepository extends JpaRepository<ReferralRecord, Long> {
    List<ReferralRecord> findByReferrerUserIdOrderByCreatedAtDesc(Long referrerUserId);
    Optional<ReferralRecord> findByRefereeUserId(Long refereeUserId);
    Optional<ReferralRecord> findByRefereeUserIdAndStatus(Long refereeUserId, ReferralStatus status);
    long countByReferrerUserIdAndStatus(Long referrerUserId, ReferralStatus status);
}
