package com.backend.autoapplypro.modules.learning.dto;

import com.backend.autoapplypro.modules.learning.model.QuestionSubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReviewRequestDto {
    private QuestionSubmissionStatus status;
    private String feedback;
}
