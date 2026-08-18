package com.backend.autoapplypro.modules.govt_exams.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exam_notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "exam_name", nullable = false)
    private String examName;

    @Column(name = "organizing_body", nullable = false)
    private String organizingBody;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ExamCategory category;

    @Column(name = "vacancy_count")
    private Integer vacancyCount;

    @Column(name = "application_start_date")
    private LocalDate applicationStartDate;

    @Column(name = "application_end_date", nullable = false)
    private LocalDate applicationEndDate;

    @Column(name = "exam_date")
    private LocalDate examDate;

    @Column(name = "official_pdf_url", length = 1000)
    private String officialPdfUrl;

    @Column(name = "apply_link", length = 1000)
    private String applyLink;

    @Column(name = "eligibility_summary", columnDefinition = "TEXT")
    private String eligibilitySummary;

    @Column(name = "age_limit_summary")
    private String ageLimitSummary;

    @Column(name = "application_fee_summary")
    private String applicationFeeSummary;

    @Column(name = "source_type")
    private String sourceType; // "CRAWLER" or "API_FALLBACK"

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ExamStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ExamStatus.APPLY_NOW;
        }
        if (this.sourceType == null) {
            this.sourceType = "CRAWLER";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
