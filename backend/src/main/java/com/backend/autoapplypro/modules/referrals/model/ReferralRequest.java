package com.backend.autoapplypro.modules.referrals.model;

import com.backend.autoapplypro.modules.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "referral_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
public class ReferralRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "company_domain", nullable = false)
    private String companyDomain;

    @Column(name = "job_id", nullable = false)
    private String jobId;

    @Column(name = "job_link", nullable = false, length = 1000)
    private String jobLink;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "skills_required", columnDefinition = "jsonb")
    private List<String> skillsRequired;

    @Column(name = "experience_required")
    private String experienceRequired;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReferralRequestStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ReferralRequestStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
