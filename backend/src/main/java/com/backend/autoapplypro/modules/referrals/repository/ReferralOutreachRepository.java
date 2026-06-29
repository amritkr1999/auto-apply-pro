package com.backend.autoapplypro.modules.referrals.repository;

import com.backend.autoapplypro.modules.referrals.model.ReferralOutreach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReferralOutreachRepository extends JpaRepository<ReferralOutreach, Long> {
    List<ReferralOutreach> findByReferralRequestId(Long referralRequestId);
    long countByReferralRequestId(Long referralRequestId);
}
