package com.backend.autoapplypro.modules.govt_exams.service;

import java.util.Map;

public interface GovtExamIngestionService {
    Map<String, Object> executeAutonomousIngestionPipeline();
}
