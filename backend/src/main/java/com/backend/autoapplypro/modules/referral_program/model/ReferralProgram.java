package com.backend.autoapplypro.modules.referral_program.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_referral_programs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "referral_code", nullable = false, unique = true, length = 30)
    private String referralCode;

    @Builder.Default
    @Column(name = "total_clicks", nullable = false)
    private Integer totalClicks = 0;

    @Builder.Default
    @Column(name = "total_signups", nullable = false)
    private Integer totalSignups = 0;

    @Builder.Default
    @Column(name = "total_conversions", nullable = false)
    private Integer totalConversions = 0;

    @Builder.Default
    @Column(name = "earned_trial_days", nullable = false)
    private Integer earnedTrialDays = 0;

    @Builder.Default
    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (totalClicks == null) totalClicks = 0;
        if (totalSignups == null) totalSignups = 0;
        if (totalConversions == null) totalConversions = 0;
        if (earnedTrialDays == null) earnedTrialDays = 0;
        if (isEnabled == null) isEnabled = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
