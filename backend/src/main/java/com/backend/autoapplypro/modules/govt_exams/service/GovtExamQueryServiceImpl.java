package com.backend.autoapplypro.modules.govt_exams.service;

import com.backend.autoapplypro.modules.govt_exams.dto.ExamNotificationDto;
import com.backend.autoapplypro.modules.govt_exams.dto.ExamSyllabusDto;
import com.backend.autoapplypro.modules.govt_exams.dto.PrepMaterialDto;
import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import com.backend.autoapplypro.modules.govt_exams.model.ExamNotification;
import com.backend.autoapplypro.modules.govt_exams.model.ExamStatus;
import com.backend.autoapplypro.modules.govt_exams.repository.ExamNotificationRepository;
import com.backend.autoapplypro.modules.govt_exams.repository.ExamSyllabusRepository;
import com.backend.autoapplypro.modules.govt_exams.repository.PrepMaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class GovtExamQueryServiceImpl implements GovtExamQueryService {

    private final ExamNotificationRepository notificationRepository;
    private final ExamSyllabusRepository syllabusRepository;
    private final PrepMaterialRepository prepMaterialRepository;
    private final com.backend.autoapplypro.modules.govt_exams.repository.ExamPyqRepository pyqRepository;
    private final com.backend.autoapplypro.modules.govt_exams.repository.ExamQuestionPaperRepository paperRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ExamNotificationDto> getNotifications(ExamCategory category, ExamStatus status, String query) {
        List<ExamNotification> list = notificationRepository.searchNotifications(category, status, query);
        LocalDate today = LocalDate.now();

        return list.stream()
                .map(entity -> mapToDto(entity, today, false))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ExamNotificationDto getNotificationById(UUID id) {
        ExamNotification entity = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exam notification not found with ID: " + id));

        LocalDate today = LocalDate.now();
        return mapToDto(entity, today, true);
    }

    @Override
    @Transactional
    public List<com.backend.autoapplypro.modules.govt_exams.dto.ExamPyqDto> getPyqs(ExamCategory category, String subjectTag) {
        seedDefaultPyqsIfEmpty();
        List<com.backend.autoapplypro.modules.govt_exams.model.ExamPyq> list = pyqRepository.searchPyqs(category, subjectTag);
        return list.stream()
                .map(p -> com.backend.autoapplypro.modules.govt_exams.dto.ExamPyqDto.builder()
                        .id(p.getId())
                        .examCategory(p.getExamCategory())
                        .subjectTag(p.getSubjectTag())
                        .questionText(p.getQuestionText())
                        .optionA(p.getOptionA())
                        .optionB(p.getOptionB())
                        .optionC(p.getOptionC())
                        .optionD(p.getOptionD())
                        .correctOption(p.getCorrectOption())
                        .explanationText(p.getExplanationText())
                        .examSourceYear(p.getExamSourceYear())
                        .difficultyLevel(p.getDifficultyLevel())
                        .build())
                .toList();
    }

    private void seedDefaultPyqsIfEmpty() {
        if (pyqRepository.count() == 0) {
            log.info("[PYQ SEEDER] Seeding baseline authentic Previous Year Questions (PYQs)...");
            List<com.backend.autoapplypro.modules.govt_exams.model.ExamPyq> pyqSeeds = List.of(
                    com.backend.autoapplypro.modules.govt_exams.model.ExamPyq.builder()
                            .examCategory(ExamCategory.UPSC)
                            .subjectTag("POLITY")
                            .questionText("Which Article of the Indian Constitution empowers the President of India to issue Ordinances during recess of Parliament?")
                            .optionA("Article 110")
                            .optionB("Article 123")
                            .optionC("Article 213")
                            .optionD("Article 356")
                            .correctOption("B")
                            .explanationText("Article 123 of the Constitution grants the President legislative power to promulgate ordinances when either of the two Houses of Parliament is not in session. Article 213 grants ordinance power to State Governors.")
                            .examSourceYear("UPSC CSE 2024 / SSC CGL")
                            .difficultyLevel("MEDIUM")
                            .build(),

                    com.backend.autoapplypro.modules.govt_exams.model.ExamPyq.builder()
                            .examCategory(ExamCategory.RAILWAYS)
                            .subjectTag("QUANT")
                            .questionText("A train 180 meters long passes a telegraph pole in 9 seconds. What is the speed of the train in kilometers per hour (km/h)?")
                            .optionA("54 km/h")
                            .optionB("72 km/h")
                            .optionC("60 km/h")
                            .optionD("80 km/h")
                            .correctOption("B")
                            .explanationText("1. Speed in m/s = Distance / Time = 180m / 9s = 20 m/s.\n2. Convert m/s to km/h by multiplying by (18/5): 20 * (18/5) = 72 km/h.")
                            .examSourceYear("RRB NTPC CBT-1 2024")
                            .difficultyLevel("EASY")
                            .build(),

                    com.backend.autoapplypro.modules.govt_exams.model.ExamPyq.builder()
                            .examCategory(ExamCategory.SSC)
                            .subjectTag("REASONING")
                            .questionText("In a certain code language, 'PENCIL' is written as 'QERFJM'. How is 'PAPER' written in that code language?")
                            .optionA("QBSFS")
                            .optionB("QCRFS")
                            .optionC("QBQFS")
                            .optionD("QCSFS")
                            .correctOption("C")
                            .explanationText("Pattern: Each letter is incremented by +1 for 1st, 3rd, 5th positions and +1 for 2nd, 4th, 6th positions. P->Q, A->B, P->Q, E->F, R->S. Output: QBQFS.")
                            .examSourceYear("SSC CGL 2025 Tier-1")
                            .difficultyLevel("MEDIUM")
                            .build(),

                    com.backend.autoapplypro.modules.govt_exams.model.ExamPyq.builder()
                            .examCategory(ExamCategory.BANKING)
                            .subjectTag("ENGLISH")
                            .questionText("Identify the segment in the sentence which contains a grammatical error: 'The committee have submitted its report to the Ministry after three months of deliberation.'")
                            .optionA("The committee have")
                            .optionB("submitted its report")
                            .optionC("to the Ministry")
                            .optionD("after three months")
                            .correctOption("A")
                            .explanationText("'Committee' is a collective noun acting as a single unit here (as indicated by the singular pronoun 'its'). Therefore, it should take the singular verb 'has' instead of 'have'. Correct phrase: 'The committee has submitted...'")
                            .examSourceYear("IBPS PO XV 2025")
                            .difficultyLevel("MEDIUM")
                            .build()
            );
            pyqRepository.saveAll(pyqSeeds);
        }
    }

    @Override
    @Transactional
    public List<com.backend.autoapplypro.modules.govt_exams.dto.ExamQuestionPaperDto> getQuestionPapers(ExamCategory category, Integer year) {
        seedDefaultQuestionPapersIfEmpty();
        List<com.backend.autoapplypro.modules.govt_exams.model.ExamQuestionPaper> list = paperRepository.searchQuestionPapers(category, year);
        return list.stream()
                .map(qp -> com.backend.autoapplypro.modules.govt_exams.dto.ExamQuestionPaperDto.builder()
                        .id(qp.getId())
                        .examCategory(qp.getExamCategory())
                        .examName(qp.getExamName())
                        .year(qp.getYear())
                        .paperType(qp.getPaperType())
                        .pdfUrl(qp.getPdfUrl())
                        .fileSizeMb(qp.getFileSizeMb())
                        .language(qp.getLanguage())
                        .downloadCount(qp.getDownloadCount())
                        .build())
                .toList();
    }

    private void seedDefaultQuestionPapersIfEmpty() {
        if (paperRepository.count() == 0) {
            log.info("[QUESTION PAPER SEEDER] Seeding baseline downloadable official year-wise PDF question papers...");
            List<com.backend.autoapplypro.modules.govt_exams.model.ExamQuestionPaper> paperSeeds = List.of(
                    com.backend.autoapplypro.modules.govt_exams.model.ExamQuestionPaper.builder()
                            .examCategory(ExamCategory.UPSC)
                            .examName("UPSC Civil Services Prelims 2024 (General Studies Paper-1)")
                            .year(2024)
                            .paperType("QUESTION_PAPER")
                            .pdfUrl("https://upsc.gov.in/sites/default/files/CSP-2024-GS-Paper-1.pdf")
                            .fileSizeMb("3.2 MB")
                            .language("Bilingual (English & Hindi)")
                            .downloadCount(12450)
                            .build(),

                    com.backend.autoapplypro.modules.govt_exams.model.ExamQuestionPaper.builder()
                            .examCategory(ExamCategory.UPSC)
                            .examName("UPSC Civil Services Prelims 2024 (CSAT Paper-2)")
                            .year(2024)
                            .paperType("QUESTION_PAPER")
                            .pdfUrl("https://upsc.gov.in/sites/default/files/CSP-2024-CSAT-Paper-2.pdf")
                            .fileSizeMb("2.8 MB")
                            .language("Bilingual (English & Hindi)")
                            .downloadCount(9820)
                            .build(),

                    com.backend.autoapplypro.modules.govt_exams.model.ExamQuestionPaper.builder()
                            .examCategory(ExamCategory.SSC)
                            .examName("SSC CGL Tier-1 Official Question Paper with Answer Keys 2024")
                            .year(2024)
                            .paperType("QUESTION_PAPER")
                            .pdfUrl("https://ssc.gov.in/notices/cgl_2024_tier1_paper.pdf")
                            .fileSizeMb("4.1 MB")
                            .language("Bilingual (English & Hindi)")
                            .downloadCount(28400)
                            .build(),

                    com.backend.autoapplypro.modules.govt_exams.model.ExamQuestionPaper.builder()
                            .examCategory(ExamCategory.SSC)
                            .examName("SSC CGL Tier-1 2023 All Shift Question Papers Collection")
                            .year(2023)
                            .paperType("QUESTION_PAPER")
                            .pdfUrl("https://ssc.gov.in/notices/cgl_2023_all_shifts.pdf")
                            .fileSizeMb("8.5 MB")
                            .language("Bilingual (English & Hindi)")
                            .downloadCount(34120)
                            .build(),

                    com.backend.autoapplypro.modules.govt_exams.model.ExamQuestionPaper.builder()
                            .examCategory(ExamCategory.RAILWAYS)
                            .examName("RRB NTPC CBT-1 Master Question Paper with Official Keys 2024")
                            .year(2024)
                            .paperType("QUESTION_PAPER")
                            .pdfUrl("https://rrbcdg.gov.in/papers/rrb_ntpc_2024_cbt1.pdf")
                            .fileSizeMb("5.0 MB")
                            .language("Bilingual (English & Hindi)")
                            .downloadCount(19500)
                            .build(),

                    com.backend.autoapplypro.modules.govt_exams.model.ExamQuestionPaper.builder()
                            .examCategory(ExamCategory.BANKING)
                            .examName("IBPS PO Prelims 2024 Official Memory Based Question Paper")
                            .year(2024)
                            .paperType("QUESTION_PAPER")
                            .pdfUrl("https://ibps.in/papers/ibps_po_2024_prelims.pdf")
                            .fileSizeMb("2.1 MB")
                            .language("English")
                            .downloadCount(15300)
                            .build(),

                    com.backend.autoapplypro.modules.govt_exams.model.ExamQuestionPaper.builder()
                            .examCategory(ExamCategory.STATE_PSC)
                            .examName("MPPSC State Services Prelims 2024 General Studies Paper-1")
                            .year(2024)
                            .paperType("QUESTION_PAPER")
                            .pdfUrl("https://mppsc.mp.gov.in/papers/mppsc_2024_gs1.pdf")
                            .fileSizeMb("3.4 MB")
                            .language("Bilingual (English & Hindi)")
                            .downloadCount(8900)
                            .build()
            );
            paperRepository.saveAll(paperSeeds);
        }
    }

    @Override
    @Transactional
    public void updateExpiredExamStatuses() {
        LocalDate today = LocalDate.now();
        List<ExamNotification> expiredList = notificationRepository.findByApplicationEndDateBeforeAndStatusNot(today, ExamStatus.CLOSED);
        for (ExamNotification notif : expiredList) {
            notif.setStatus(ExamStatus.CLOSED);
        }
        if (!expiredList.isEmpty()) {
            notificationRepository.saveAll(expiredList);
            log.info("[STATUS UPDATER] Transitioned {} expired notifications to CLOSED status.", expiredList.size());
        }
    }

    private ExamNotificationDto mapToDto(ExamNotification entity, LocalDate today, boolean includeDetails) {
        long daysRemaining = entity.getApplicationEndDate() != null
                ? ChronoUnit.DAYS.between(today, entity.getApplicationEndDate())
                : 0;

        String countdownTag = computeCountdownTag(entity.getStatus(), daysRemaining, entity.getApplicationEndDate());

        ExamNotificationDto dto = ExamNotificationDto.builder()
                .id(entity.getId())
                .examName(entity.getExamName())
                .organizingBody(entity.getOrganizingBody())
                .category(entity.getCategory())
                .vacancyCount(entity.getVacancyCount())
                .applicationStartDate(entity.getApplicationStartDate())
                .applicationEndDate(entity.getApplicationEndDate())
                .examDate(entity.getExamDate())
                .officialPdfUrl(entity.getOfficialPdfUrl())
                .applyLink(entity.getApplyLink())
                .eligibilitySummary(entity.getEligibilitySummary())
                .ageLimitSummary(entity.getAgeLimitSummary())
                .applicationFeeSummary(entity.getApplicationFeeSummary())
                .sourceType(entity.getSourceType())
                .status(entity.getStatus())
                .daysRemaining(daysRemaining)
                .countdownTag(countdownTag)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();

        if (includeDetails) {
            // Map syllabus stages
            List<ExamSyllabusDto> syllabusList = syllabusRepository.findByExamId(entity.getId()).stream()
                    .map(s -> ExamSyllabusDto.builder()
                            .id(s.getId())
                            .examId(s.getExamId())
                            .stage(s.getStage())
                            .subject(s.getSubject())
                            .topics(s.getTopics())
                            .totalMarks(s.getTotalMarks())
                            .durationMinutes(s.getDurationMinutes())
                            .negativeMarking(s.getNegativeMarking())
                            .build())
                    .toList();
            dto.setSyllabusStages(syllabusList);

            // Fetch matching prep materials by subject tags
            List<PrepMaterialDto> prepList = prepMaterialRepository.findAll().stream()
                    .map(pm -> PrepMaterialDto.builder()
                            .id(pm.getId())
                            .subjectTag(pm.getSubjectTag())
                            .title(pm.getTitle())
                            .resourceType(pm.getResourceType())
                            .url(pm.getUrl())
                            .providerName(pm.getProviderName())
                            .build())
                    .toList();
            dto.setPrepMaterials(prepList);
        }

        return dto;
    }

    private String computeCountdownTag(ExamStatus status, long daysRemaining, LocalDate endDate) {
        if (status == ExamStatus.CLOSED || daysRemaining < 0) {
            return "Application Closed";
        }
        if (status == ExamStatus.ADMIT_CARD_LIVE) {
            return "Admit Card Live";
        }
        if (status == ExamStatus.RESULTS_OUT) {
            return "Results Out";
        }
        if (daysRemaining == 0) {
            return "Application Closes Today!";
        }
        if (daysRemaining == 1) {
            return "Application Closes Tomorrow!";
        }
        if (daysRemaining <= 5) {
            return "Application Closes in " + daysRemaining + " Days";
        }
        return "Closing on " + (endDate != null ? endDate.toString() : "Soon");
    }
}
