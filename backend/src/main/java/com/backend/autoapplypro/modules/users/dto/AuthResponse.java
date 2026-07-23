package com.backend.autoapplypro.modules.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
