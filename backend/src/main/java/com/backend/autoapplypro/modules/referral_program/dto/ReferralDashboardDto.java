package com.backend.autoapplypro.modules.referral_program.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralDashboardDto {
    private String referralCode;
    private String referralLink;
    private Integer totalClicks;
    private Integer totalSignups;
    private Integer totalConversions;
    private Integer earnedTrialDays;
    private Boolean comingSoon;
    private String programStatusMessage;
    private List<ReferralRecordDto> recentReferrals;
}
