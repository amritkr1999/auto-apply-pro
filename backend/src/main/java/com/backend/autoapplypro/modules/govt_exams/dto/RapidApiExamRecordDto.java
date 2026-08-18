package com.backend.autoapplypro.modules.govt_exams.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RapidApiExamRecordDto {
    private String title;
    private String organization;
    private String category;
    private Integer vacancies;
    private String startDate;
    private String endDate;
    private String examDate;
    private String pdfUrl;
    private String applyUrl;
    private String eligibility;
    private String ageLimit;
    private String fee;
}
