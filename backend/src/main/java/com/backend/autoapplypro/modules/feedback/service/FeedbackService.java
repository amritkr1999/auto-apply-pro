package com.backend.autoapplypro.modules.feedback.service;

import com.backend.autoapplypro.modules.feedback.dto.FeedbackRequestDto;
import com.backend.autoapplypro.modules.feedback.dto.FeedbackResponseDto;
import com.backend.autoapplypro.modules.feedback.dto.FeedbackStatusResponse;
import java.util.List;

public interface FeedbackService {
    FeedbackResponseDto submitFeedback(Long userId, FeedbackRequestDto requestDto);
    List<FeedbackResponseDto> getAllFeedbacks();
    FeedbackStatusResponse getFeedbackStatus(Long userId);
}
