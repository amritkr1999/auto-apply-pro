package com.backend.autoapplypro.modules.govt_exams.dto;

import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import com.backend.autoapplypro.modules.govt_exams.model.ExamStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamNotificationDto {
    private UUID id;
    private String examName;
    private String organizingBody;
    private ExamCategory category;
    private Integer vacancyCount;
    private LocalDate applicationStartDate;
    private LocalDate applicationEndDate;
    private LocalDate examDate;
    private String officialPdfUrl;
    private String applyLink;
    private String eligibilitySummary;
    private String ageLimitSummary;
    private String applicationFeeSummary;
    private String sourceType;
    private ExamStatus status;
    private Long daysRemaining;
    private String countdownTag;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<ExamSyllabusDto> syllabusStages;
    private List<PrepMaterialDto> prepMaterials;
}
