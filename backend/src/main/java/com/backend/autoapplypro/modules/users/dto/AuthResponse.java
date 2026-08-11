package com.backend.autoapplypro.modules.users.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String name;
    private String mobile;
    private String officialEmail;
    private String role;
    private Integer loginStreak;
    private Boolean isPendingDeletion;
    private String deletionScheduledAt;
    private String avatar;
    private Boolean isEmailVerified;
    private Boolean requiresVerification;
    private String devVerificationCode;
    private Boolean isTrialActive;
    private Long trialDaysRemaining;
    private String trialEndAt;
    private String trialTier;
    private Boolean trialUsed;
}
