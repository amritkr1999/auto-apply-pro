package com.backend.autoapplypro.modules.referral_program.service;

import com.backend.autoapplypro.modules.referral_program.dto.ReferralDashboardDto;
import com.backend.autoapplypro.modules.referral_program.dto.ReferralStatusResponseDto;
import com.backend.autoapplypro.modules.referral_program.model.ReferralProgram;

public interface ReferralProgramService {
    String generateUniqueReferralCode();
    ReferralProgram getOrCreateUserProgram(Long userId);
    ReferralDashboardDto getUserDashboard(Long userId);
    void trackClick(String referralCode);
    void processReferralSignup(Long refereeUserId, String referralCode);
    void processSubscriptionConversion(Long refereeUserId);
    ReferralStatusResponseDto getProgramStatus();
}
