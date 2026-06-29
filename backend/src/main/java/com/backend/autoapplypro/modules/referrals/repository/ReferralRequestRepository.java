package com.backend.autoapplypro.modules.referrals.repository;

import com.backend.autoapplypro.modules.referrals.model.ReferralRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReferralRequestRepository extends JpaRepository<ReferralRequest, Long> {
    List<ReferralRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
}
