package com.backend.autoapplypro.modules.learning.service;

import com.backend.autoapplypro.modules.learning.dto.QuestionRatingRequestDto;

public interface QuestionRatingService {
    void rateQuestion(Long questionId, QuestionRatingRequestDto dto, String userEmail);
}
