package com.backend.autoapplypro.modules.govt_exams.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exam_question_papers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestionPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_category", nullable = false)
    private ExamCategory examCategory;

    @Column(name = "exam_name", nullable = false)
    private String examName;

    @Column(name = "year", nullable = false)
    private Integer year; // 2025, 2024, 2023, etc.

    @Column(name = "paper_type", nullable = false)
    private String paperType; // QUESTION_PAPER, ANSWER_KEY, SOLUTION_PDF

    @Column(name = "pdf_url", nullable = false, length = 1000)
    private String pdfUrl;

    @Column(name = "file_size_mb")
    private String fileSizeMb;

    @Column(name = "language")
    private String language; // "English & Hindi (Bilingual)", "English"

    @Column(name = "download_count")
    private Integer downloadCount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.downloadCount == null) {
            this.downloadCount = 0;
        }
        if (this.language == null) {
            this.language = "Bilingual (English & Hindi)";
        }
    }
}
