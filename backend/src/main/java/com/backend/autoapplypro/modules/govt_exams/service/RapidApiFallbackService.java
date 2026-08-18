package com.backend.autoapplypro.modules.govt_exams.service;

import com.backend.autoapplypro.modules.govt_exams.dto.ExamNotificationDto;
import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;

import java.util.List;

public interface RapidApiFallbackService {
    List<ExamNotificationDto> fetchFallbackNotifications(ExamCategory category);
}
