package com.backend.autoapplypro.modules.learning.service;

import com.backend.autoapplypro.modules.learning.dto.AdminReviewRequestDto;
import com.backend.autoapplypro.modules.learning.dto.QuestionSubmissionRequestDto;
import com.backend.autoapplypro.modules.learning.dto.QuestionSubmissionResponseDto;

import java.util.List;

public interface QuestionSubmissionService {
    QuestionSubmissionResponseDto submitQuestion(QuestionSubmissionRequestDto dto, String userEmail);
    List<QuestionSubmissionResponseDto> getPendingSubmissions();
    List<QuestionSubmissionResponseDto> getUserSubmissions(String userEmail);
    QuestionSubmissionResponseDto reviewSubmission(Long submissionId, AdminReviewRequestDto dto, String adminEmail);
}
