package com.backend.autoapplypro.modules.users.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"candidate", "recruiter", "company"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String mobile;

    @Column(name = "official_email")
    private String officialEmail;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Candidate candidate;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Recruiter recruiter;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Company company;

    @Builder.Default
    @Column(name = "daily_limit")
    private Integer dailyLimit = 50;

    @Builder.Default
    @Column(name = "sent_today")
    private Integer sentToday = 0;

    @Column(name = "last_sent_reset")
    private java.time.LocalDate lastSentReset;

    @Builder.Default
    @Column(name = "outreach_min_interval_min")
    private Integer outreachMinIntervalMin = 10;

    @Builder.Default
    @Column(name = "outreach_max_interval_min")
    private Integer outreachMaxIntervalMin = 30;

    @Builder.Default
    @Column(name = "outreach_slot_start")
    private java.time.LocalTime outreachSlotStart = java.time.LocalTime.of(9, 0);

    @Builder.Default
    @Column(name = "outreach_slot_end")
    private java.time.LocalTime outreachSlotEnd = java.time.LocalTime.of(17, 0);

    @Builder.Default
    @Column(name = "outreach_timezone")
    private String outreachTimezone = "UTC";

    @Builder.Default
    @Column(name = "outreach_skip_weekends")
    private Boolean outreachSkipWeekends = true;

    @Builder.Default
    @Column(name = "hr_outreach_campaign_enabled")
    private Boolean hrOutreachCampaignEnabled = false;

    @Builder.Default
    @Column(name = "hr_outreach_target_role")
    private String hrOutreachTargetRole = "Software Engineer";

    @Builder.Default
    @Column(name = "hr_outreach_template_id")
    private String hrOutreachTemplateId = "default-1";

    @Builder.Default
    @Column(name = "hr_outreach_source_table")
    private String hrOutreachSourceTable = "TESTING";

    @Builder.Default
    @Column(name = "login_streak")
    private Integer loginStreak = 0;

    @Column(name = "last_login_date")
    private java.time.LocalDate lastLoginDate;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (dailyLimit == null) {
            dailyLimit = 50;
        }
        if (sentToday == null) {
            sentToday = 0;
        }
        if (lastSentReset == null) {
            lastSentReset = java.time.LocalDate.now();
        }
        if (outreachMinIntervalMin == null) {
            outreachMinIntervalMin = 10;
        }
        if (outreachMaxIntervalMin == null) {
            outreachMaxIntervalMin = 30;
        }
        if (outreachSlotStart == null) {
            outreachSlotStart = java.time.LocalTime.of(9, 0);
        }
        if (outreachSlotEnd == null) {
            outreachSlotEnd = java.time.LocalTime.of(17, 0);
        }
        if (outreachTimezone == null) {
            outreachTimezone = "UTC";
        }
        if (outreachSkipWeekends == null) {
            outreachSkipWeekends = true;
        }
        if (hrOutreachCampaignEnabled == null) {
            hrOutreachCampaignEnabled = false;
        }
        if (hrOutreachTargetRole == null) {
            hrOutreachTargetRole = "Software Engineer";
        }
        if (hrOutreachTemplateId == null) {
            hrOutreachTemplateId = "default-1";
        }
        if (hrOutreachSourceTable == null) {
            hrOutreachSourceTable = "TESTING";
        }
        if (loginStreak == null) {
            loginStreak = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
