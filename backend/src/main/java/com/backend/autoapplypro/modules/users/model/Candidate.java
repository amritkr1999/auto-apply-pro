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
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

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

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "resume_bytes")
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
}
