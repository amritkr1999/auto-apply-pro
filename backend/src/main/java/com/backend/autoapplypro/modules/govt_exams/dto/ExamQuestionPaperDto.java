package com.backend.autoapplypro.modules.govt_exams.dto;

import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestionPaperDto {
    private UUID id;
    private ExamCategory examCategory;
    private String examName;
    private Integer year;
    private String paperType;
    private String pdfUrl;
    private String fileSizeMb;
    private String language;
    private Integer downloadCount;
}
