package com.backend.autoapplypro.modules.govt_exams.service;

import com.backend.autoapplypro.modules.govt_exams.dto.ExamNotificationDto;
import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import com.backend.autoapplypro.modules.govt_exams.model.ExamNotification;
import com.backend.autoapplypro.modules.govt_exams.model.PrepMaterial;
import com.backend.autoapplypro.modules.govt_exams.repository.ExamNotificationRepository;
import com.backend.autoapplypro.modules.govt_exams.repository.PrepMaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class GovtExamIngestionServiceImpl implements GovtExamIngestionService {

    private final GovtPortalCrawlerService crawlerService;
    private final RapidApiFallbackService fallbackService;
    private final SyllabusChunkerService syllabusChunkerService;
    private final ExamNotificationRepository notificationRepository;
    private final PrepMaterialRepository prepMaterialRepository;

    @Override
    @Transactional
    public Map<String, Object> executeAutonomousIngestionPipeline() {
        log.info("[AUTONOMOUS INGESTION PIPELINE] Starting hands-free government notification crawl and structuring cycle...");
        int totalIngested = 0;
        int crawlerCount = 0;
        int fallbackCount = 0;
        List<String> logsList = new ArrayList<>();

        // Ensure baseline static open prep materials exist in database
        seedDefaultPrepMaterialsIfEmpty();

        for (ExamCategory category : ExamCategory.values()) {
            List<ExamNotificationDto> categoryItems = new ArrayList<>();
            try {
                // Primary strategy: Automated Jsoup Web Crawler
                List<ExamNotificationDto> crawled = crawlerService.crawlPortal(category);
                if (crawled != null && !crawled.isEmpty()) {
                    categoryItems.addAll(crawled);
                    crawlerCount += crawled.size();
                    logsList.add("Successfully crawled " + crawled.size() + " items for " + category + " via Jsoup Web Crawler.");
                } else {
                    throw new IllegalStateException("Crawler returned empty list for " + category);
                }
            } catch (Exception e) {
                // Secondary strategy: Failover Circuit to RapidAPI JSON Stream
                log.warn("[INGESTION FAILOVER TRIGGERED] Jsoup parsing failed for category {}: {}. Switching automatically to RapidAPI fallback...", category, e.getMessage());
                List<ExamNotificationDto> fallback = fallbackService.fetchFallbackNotifications(category);
                categoryItems.addAll(fallback);
                fallbackCount += fallback.size();
                logsList.add("Failover activated for " + category + ": Fetched " + fallback.size() + " items via RapidAPI JSON stream.");
            }

            // Persist or Update into PostgreSQL Database
            for (ExamNotificationDto dto : categoryItems) {
                Optional<ExamNotification> existingOpt = notificationRepository.findByExamNameAndOrganizingBody(dto.getExamName(), dto.getOrganizingBody());
                ExamNotification entity;
                if (existingOpt.isPresent()) {
                    entity = existingOpt.get();
                    entity.setVacancyCount(dto.getVacancyCount());
                    entity.setApplicationEndDate(dto.getApplicationEndDate());
                    entity.setExamDate(dto.getExamDate());
                    entity.setOfficialPdfUrl(dto.getOfficialPdfUrl());
                    entity.setApplyLink(dto.getApplyLink());
                    entity.setStatus(dto.getStatus());
                } else {
                    entity = ExamNotification.builder()
                            .examName(dto.getExamName())
                            .organizingBody(dto.getOrganizingBody())
                            .category(dto.getCategory())
                            .vacancyCount(dto.getVacancyCount())
                            .applicationStartDate(dto.getApplicationStartDate())
                            .applicationEndDate(dto.getApplicationEndDate())
                            .examDate(dto.getExamDate())
                            .officialPdfUrl(dto.getOfficialPdfUrl())
                            .applyLink(dto.getApplyLink())
                            .eligibilitySummary(dto.getEligibilitySummary())
                            .ageLimitSummary(dto.getAgeLimitSummary())
                            .applicationFeeSummary(dto.getApplicationFeeSummary())
                            .sourceType(dto.getSourceType())
                            .status(dto.getStatus())
                            .build();
                }

                ExamNotification saved = notificationRepository.save(entity);
                totalIngested++;

                // Automatically generate & map Syllabus stages
                syllabusChunkerService.generateAndSaveSyllabusForExam(saved.getId(), saved.getExamName(), saved.getCategory());
            }
        }

        // Weekly Gazette Watcher
        try {
            List<ExamNotificationDto> gazetteItems = crawlerService.crawlEmploymentNews();
            for (ExamNotificationDto dto : gazetteItems) {
                if (notificationRepository.findByExamNameAndOrganizingBody(dto.getExamName(), dto.getOrganizingBody()).isEmpty()) {
                    ExamNotification saved = notificationRepository.save(ExamNotification.builder()
                            .examName(dto.getExamName())
                            .organizingBody(dto.getOrganizingBody())
                            .category(dto.getCategory())
                            .vacancyCount(dto.getVacancyCount())
                            .applicationStartDate(dto.getApplicationStartDate())
                            .applicationEndDate(dto.getApplicationEndDate())
                            .officialPdfUrl(dto.getOfficialPdfUrl())
                            .applyLink(dto.getApplyLink())
                            .eligibilitySummary(dto.getEligibilitySummary())
                            .ageLimitSummary(dto.getAgeLimitSummary())
                            .applicationFeeSummary(dto.getApplicationFeeSummary())
                            .sourceType(dto.getSourceType())
                            .status(dto.getStatus())
                            .build());
                    totalIngested++;
                    syllabusChunkerService.generateAndSaveSyllabusForExam(saved.getId(), saved.getExamName(), saved.getCategory());
                }
            }
            logsList.add("Employment News weekly watcher processed " + gazetteItems.size() + " bulletin notices.");
        } catch (Exception e) {
            log.error("[INGESTION GAZETTE WARN] Employment News watcher error: {}", e.getMessage());
        }

        log.info("[AUTONOMOUS INGESTION PIPELINE SUCCESS] Total records processed: {}. Crawler: {}, Fallback: {}", totalIngested, crawlerCount, fallbackCount);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("status", "SUCCESS");
        resultMap.put("totalRecordsProcessed", totalIngested);
        resultMap.put("primaryCrawlerRecords", crawlerCount);
        resultMap.put("secondaryFallbackRecords", fallbackCount);
        resultMap.put("executionLogs", logsList);
        return resultMap;
    }

    private void seedDefaultPrepMaterialsIfEmpty() {
        if (prepMaterialRepository.count() == 0) {
            log.info("[PREP MATERIAL SEEDER] Seeding baseline open-source educational guides and PYQ banks...");
            List<PrepMaterial> seeds = List.of(
                    PrepMaterial.builder()
                            .subjectTag("Quantitative Aptitude")
                            .title("Complete Quantitative Aptitude & Data Interpretation Guide (Fast-Track Math)")
                            .resourceType("TEXT_GUIDE")
                            .url("https://archive.org/details/fast-track-objective-arithmetic")
                            .providerName("Open Educational Archive")
                            .build(),
                    PrepMaterial.builder()
                            .subjectTag("General Intelligence & Reasoning")
                            .title("Verbal & Non-Verbal Reasoning Conceptual PYQ Bank (1500+ Practice MCQs)")
                            .resourceType("PYQ_BANK")
                            .url("https://archive.org/details/verbal-nonverbal-reasoning")
                            .providerName("National Learning Resource Repository")
                            .build(),
                    PrepMaterial.builder()
                            .subjectTag("General Awareness & GK")
                            .title("NCERT Indian Polity & History Summary Handbook (Articles, Amendments & Dates)")
                            .resourceType("PDF_NOTES")
                            .url("https://ncert.nic.in/textbook.php")
                            .providerName("NCERT Official Open Portal")
                            .build(),
                    PrepMaterial.builder()
                            .subjectTag("English Comprehension")
                            .title("English Grammar, Cloze Test & Vocabulary Builder Notes")
                            .resourceType("TEXT_GUIDE")
                            .url("https://archive.org/details/english-grammar-in-use")
                            .providerName("Open Humanities Project")
                            .build()
            );
            prepMaterialRepository.saveAll(seeds);
        }
    }
}
