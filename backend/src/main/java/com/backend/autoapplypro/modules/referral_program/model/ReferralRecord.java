package com.backend.autoapplypro.modules.referral_program.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_referral_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "referrer_user_id", nullable = false)
    private Long referrerUserId;

    @Column(name = "referee_user_id", nullable = false, unique = true)
    private Long refereeUserId;

    @Column(name = "referral_code", nullable = false, length = 30)
    private String referralCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private ReferralStatus status = ReferralStatus.PENDING;

    @Builder.Default
    @Column(name = "reward_trial_days", nullable = false)
    private Integer rewardTrialDays = 7;

    @Column(name = "converted_at")
    private LocalDateTime convertedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = ReferralStatus.PENDING;
        if (rewardTrialDays == null) rewardTrialDays = 7;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
