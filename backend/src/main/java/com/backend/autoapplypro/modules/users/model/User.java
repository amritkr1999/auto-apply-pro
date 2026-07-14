package com.backend.autoapplypro.modules.users.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"professionalProfiles", "recruiter", "company"})
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

    @Enumerated(EnumType.STRING)
    @Column(name = "professional_vertical")
    @ColumnDefault("'DEVELOPER'")
    @Builder.Default
    private ProfessionalVertical professionalVertical = ProfessionalVertical.DEVELOPER;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String mobile;

    @Column(name = "username", unique = true)
    private String username;

    @Builder.Default
    @Column(name = "is_profile_public")
    private Boolean isProfilePublic = false;

    @Column(name = "official_email")
    private String officialEmail;

    @Lob
    @Column(name = "avatar", columnDefinition = "TEXT")
    private String avatar;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private java.util.List<ProfessionalProfile> professionalProfiles = new java.util.ArrayList<>();

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

    @Builder.Default
    @Column(name = "marketing_emails_enabled", nullable = false)
    private Boolean marketingEmailsEnabled = true;

    @Column(name = "unsubscribe_token")
    private String unsubscribeToken;

    @Builder.Default
    @Column(name = "marketing_campaign_step")
    private Integer marketingCampaignStep = 0;

    @Column(name = "last_marketing_email_sent_at")
    private LocalDateTime lastMarketingEmailSentAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 25)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "deletion_scheduled_at")
    private LocalDateTime deletionScheduledAt;

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
        if (marketingEmailsEnabled == null) {
            marketingEmailsEnabled = true;
        }
        if (unsubscribeToken == null) {
            unsubscribeToken = java.util.UUID.randomUUID().toString();
        }
        if (marketingCampaignStep == null) {
            marketingCampaignStep = 0;
        }
        if (status == null) {
            status = UserStatus.ACTIVE;
        }
        if (username == null && email != null) {
            String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "");
            username = base + "_" + java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        if (isProfilePublic == null) {
            isProfilePublic = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ProfessionalProfile getProfessionalProfile() {
        if (professionalProfiles == null || professionalProfiles.isEmpty()) {
            return null;
        }
        return professionalProfiles.stream()
                .filter(p -> p.getIsDefault() != null && p.getIsDefault())
                .findFirst()
                .orElse(professionalProfiles.get(0));
    }
}
