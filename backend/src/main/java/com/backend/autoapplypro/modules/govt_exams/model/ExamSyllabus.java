package com.backend.autoapplypro.modules.govt_exams.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "exam_syllabuses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamSyllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "exam_id", nullable = false)
    private UUID examId;

    @Column(name = "stage", nullable = false)
    private String stage; // Tier 1, Tier 2, Prelims, Mains

    @Column(name = "subject", nullable = false)
    private String subject; // Quantitative Aptitude, Reasoning, English, General Awareness, etc.

    @Column(name = "topics", columnDefinition = "TEXT")
    private String topics; // JSON payload array or formatted topic list

    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "negative_marking")
    private String negativeMarking;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
