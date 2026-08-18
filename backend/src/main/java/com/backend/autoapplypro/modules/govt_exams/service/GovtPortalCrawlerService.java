package com.backend.autoapplypro.modules.govt_exams.service;

import com.backend.autoapplypro.modules.govt_exams.dto.ExamNotificationDto;
import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;

import java.util.List;

public interface GovtPortalCrawlerService {
    List<ExamNotificationDto> crawlPortal(ExamCategory category) throws Exception;
    List<ExamNotificationDto> crawlEmploymentNews() throws Exception;
}
