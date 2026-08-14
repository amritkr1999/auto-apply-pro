package com.backend.autoapplypro.modules.referral_program.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralRecordDto {
    private Long id;
    private Long refereeUserId;
    private String refereeEmailMasked;
    private String referralCode;
    private String status;
    private Integer rewardTrialDays;
    private LocalDateTime convertedAt;
    private LocalDateTime createdAt;
}
