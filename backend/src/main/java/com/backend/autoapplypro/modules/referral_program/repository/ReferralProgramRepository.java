package com.backend.autoapplypro.modules.referral_program.repository;

import com.backend.autoapplypro.modules.referral_program.model.ReferralProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReferralProgramRepository extends JpaRepository<ReferralProgram, Long> {
    Optional<ReferralProgram> findByUserId(Long userId);
    Optional<ReferralProgram> findByReferralCode(String referralCode);
    boolean existsByReferralCode(String referralCode);
}
