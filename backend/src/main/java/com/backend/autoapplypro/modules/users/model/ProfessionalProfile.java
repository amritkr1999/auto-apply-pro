package com.backend.autoapplypro.modules.users.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "professional_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
public class ProfessionalProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "profile_name", nullable = false)
    @Builder.Default
    private String profileName = "Default Profile";

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;

    @Column(name = "target_template_id")
    private String targetTemplateId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "candidate_skills",
        joinColumns = @JoinColumn(name = "candidate_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private Set<Skill> skills = new HashSet<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "job_preferences", columnDefinition = "jsonb")
    private Map<String, Object> jobPreferences;

    @Column(name = "resume_filename")
    private String resumeFilename;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "resume_bytes", columnDefinition = "bytea")
    private byte[] resumeBytes;

    @Column(name = "resume_content_type")
    private String resumeContentType;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "education", columnDefinition = "jsonb")
    private List<Map<String, Object>> education;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "experience", columnDefinition = "jsonb")
    private List<Map<String, Object>> experience;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "certifications", columnDefinition = "jsonb")
    private List<String> certifications;

    @Column(name = "github_username")
    private String githubUsername;

    @Column(name = "github_profile_url")
    private String githubProfileUrl;

    @Column(name = "linkedin_profile_url")
    private String linkedinProfileUrl;

    @Column(name = "linkedin_name")
    private String linkedinName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "github_stats", columnDefinition = "jsonb")
    private Map<String, Object> githubStats;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "leetcode_stats", columnDefinition = "jsonb")
    private Map<String, Object> leetcodeStats;

    @Column(name = "leetcode_username")
    private String leetcodeUsername;

    @Builder.Default
    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @OneToMany(mappedBy = "professionalProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Achievement> achievements = new java.util.ArrayList<>();

    @Column(name = "is_reference_check_confirmed")
    @Builder.Default
    private Boolean isReferenceCheckConfirmed = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "excluded_companies", columnDefinition = "jsonb")
    @Builder.Default
    private List<String> excludedCompanies = new java.util.ArrayList<>();
}
