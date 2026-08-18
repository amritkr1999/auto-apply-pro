package com.backend.autoapplypro.modules.govt_exams.controller;

import com.backend.autoapplypro.modules.govt_exams.dto.ExamNotificationDto;
import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import com.backend.autoapplypro.modules.govt_exams.model.ExamStatus;
import com.backend.autoapplypro.modules.govt_exams.service.GovtExamIngestionService;
import com.backend.autoapplypro.modules.govt_exams.service.GovtExamQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/govt-exams")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Government Exams & Alerts API", description = "Autonomous central & state government job ingestion and alerts portal")
public class GovtExamController {

    private final GovtExamQueryService queryService;
    private final GovtExamIngestionService ingestionService;

    @GetMapping
    @Operation(summary = "Fetch active government exam notifications with smart filters")
    public ResponseEntity<List<ExamNotificationDto>> getNotifications(
            @RequestParam(required = false) ExamCategory category,
            @RequestParam(required = false) ExamStatus status,
            @RequestParam(required = false) String query) {
        log.info("[GOVT EXAMS API] GET /api/v1/govt-exams category={}, status={}, query={}", category, status, query);
        List<ExamNotificationDto> results = queryService.getNotifications(category, status, query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Fetch detailed government exam profile with structured syllabus & prep materials")
    public ResponseEntity<ExamNotificationDto> getNotificationById(@PathVariable UUID id) {
        log.info("[GOVT EXAMS API] GET /api/v1/govt-exams/{}", id);
        ExamNotificationDto dto = queryService.getNotificationById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/pyqs")
    @Operation(summary = "Fetch Previous Year Questions (PYQs) bank with subject & category filters")
    public ResponseEntity<List<com.backend.autoapplypro.modules.govt_exams.dto.ExamPyqDto>> getPyqs(
            @RequestParam(required = false) ExamCategory category,
            @RequestParam(required = false) String subjectTag) {
        log.info("[GOVT EXAMS API] GET /api/v1/govt-exams/pyqs category={}, subjectTag={}", category, subjectTag);
        List<com.backend.autoapplypro.modules.govt_exams.dto.ExamPyqDto> pyqs = queryService.getPyqs(category, subjectTag);
        return ResponseEntity.ok(pyqs);
    }

    @GetMapping("/question-papers")
    @Operation(summary = "Fetch year-wise downloadable PDF question papers for central and state government exams")
    public ResponseEntity<List<com.backend.autoapplypro.modules.govt_exams.dto.ExamQuestionPaperDto>> getQuestionPapers(
            @RequestParam(required = false) ExamCategory category,
            @RequestParam(required = false) Integer year) {
        log.info("[GOVT EXAMS API] GET /api/v1/govt-exams/question-papers category={}, year={}", category, year);
        List<com.backend.autoapplypro.modules.govt_exams.dto.ExamQuestionPaperDto> papers = queryService.getQuestionPapers(category, year);
        return ResponseEntity.ok(papers);
    }

    @PostMapping("/trigger-ingestion")
    @Operation(summary = "Trigger autonomous ingestion pipeline manually")
    public ResponseEntity<Map<String, Object>> triggerIngestionPipeline() {
        log.info("[GOVT EXAMS API] POST /api/v1/govt-exams/trigger-ingestion triggered");
        Map<String, Object> result = ingestionService.executeAutonomousIngestionPipeline();
        return ResponseEntity.ok(result);
    }
}
