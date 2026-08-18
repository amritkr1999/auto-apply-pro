package com.backend.autoapplypro.modules.govt_exams.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "prep_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrepMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "subject_tag", nullable = false)
    private String subjectTag; // Matches subject in syllabus (e.g., QUANT, REASONING, ENGLISH, GK, POLITY)

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "resource_type", nullable = false)
    private String resourceType; // TEXT_GUIDE, PYQ_BANK, VIDEO_LINK, PDF_NOTES

    @Column(name = "url", nullable = false, length = 1000)
    private String url;

    @Column(name = "provider_name")
    private String providerName;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
