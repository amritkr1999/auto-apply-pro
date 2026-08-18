package com.backend.autoapplypro.modules.govt_exams.service;

import com.backend.autoapplypro.modules.govt_exams.dto.ExamSyllabusDto;
import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;

import java.util.List;
import java.util.UUID;

public interface SyllabusChunkerService {
    List<ExamSyllabusDto> generateAndSaveSyllabusForExam(UUID examId, String examName, ExamCategory category);
}
