package com.backend.autoapplypro.modules.govt_exams.dto;

import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamPyqDto {
    private UUID id;
    private ExamCategory examCategory;
    private String subjectTag;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption;
    private String explanationText;
    private String examSourceYear;
    private String difficultyLevel;
}
