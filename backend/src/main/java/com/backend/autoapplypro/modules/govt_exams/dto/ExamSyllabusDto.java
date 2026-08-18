package com.backend.autoapplypro.modules.govt_exams.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamSyllabusDto {
    private UUID id;
    private UUID examId;
    private String stage;
    private String subject;
    private String topics;
    private Integer totalMarks;
    private Integer durationMinutes;
    private String negativeMarking;
}
