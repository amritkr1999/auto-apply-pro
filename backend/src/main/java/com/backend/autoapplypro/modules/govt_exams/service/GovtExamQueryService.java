package com.backend.autoapplypro.modules.govt_exams.service;

import com.backend.autoapplypro.modules.govt_exams.dto.ExamNotificationDto;
import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import com.backend.autoapplypro.modules.govt_exams.model.ExamStatus;

import java.util.List;
import java.util.UUID;

public interface GovtExamQueryService {
    List<ExamNotificationDto> getNotifications(ExamCategory category, ExamStatus status, String query);
    ExamNotificationDto getNotificationById(UUID id);
    List<com.backend.autoapplypro.modules.govt_exams.dto.ExamPyqDto> getPyqs(ExamCategory category, String subjectTag);
    List<com.backend.autoapplypro.modules.govt_exams.dto.ExamQuestionPaperDto> getQuestionPapers(ExamCategory category, Integer year);
    void updateExpiredExamStatuses();
}
