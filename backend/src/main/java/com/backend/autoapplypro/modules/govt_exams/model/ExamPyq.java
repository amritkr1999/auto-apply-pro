package com.backend.autoapplypro.modules.govt_exams.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exam_pyqs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamPyq {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_category", nullable = false)
    private ExamCategory examCategory;

    @Column(name = "subject_tag", nullable = false)
    private String subjectTag; // QUANT, REASONING, POLITY, HISTORY, GEOGRAPHY, ENGLISH, SCIENCE

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "option_a", nullable = false)
    private String optionA;

    @Column(name = "option_b", nullable = false)
    private String optionB;

    @Column(name = "option_c", nullable = false)
    private String optionC;

    @Column(name = "option_d", nullable = false)
    private String optionD;

    @Column(name = "correct_option", nullable = false, length = 5) // "A", "B", "C", "D"
    private String correctOption;

    @Column(name = "explanation_text", columnDefinition = "TEXT")
    private String explanationText;

    @Column(name = "exam_source_year")
    private String examSourceYear; // e.g. "UPSC CSE 2024", "SSC CGL 2025 Tier-1"

    @Column(name = "difficulty_level")
    private String difficultyLevel; // EASY, MEDIUM, HARD

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
