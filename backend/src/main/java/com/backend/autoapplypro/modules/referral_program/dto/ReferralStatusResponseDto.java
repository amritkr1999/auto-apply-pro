package com.backend.autoapplypro.modules.referral_program.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralStatusResponseDto {
    private Boolean comingSoon;
    private String title;
    private String description;
    private Integer rewardTrialDays;
    private String rewardTriggerCondition;
}
