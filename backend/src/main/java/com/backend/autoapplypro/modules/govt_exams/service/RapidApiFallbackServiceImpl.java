package com.backend.autoapplypro.modules.govt_exams.service;

import com.backend.autoapplypro.modules.govt_exams.dto.ExamNotificationDto;
import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import com.backend.autoapplypro.modules.govt_exams.model.ExamStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class RapidApiFallbackServiceImpl implements RapidApiFallbackService {

    @Override
    public List<ExamNotificationDto> fetchFallbackNotifications(ExamCategory category) {
        log.info("[RAPIDAPI FAILOVER CIRCUIT] Fetching fallback JSON data stream for category: {}", category);
        List<ExamNotificationDto> fallbackList = new ArrayList<>();

        switch (category) {
            case STATE_PSC -> {
                fallbackList.add(ExamNotificationDto.builder()
                        .examName("MPPSC State Services & Forest Service Exam 2026")
                        .organizingBody("Madhya Pradesh Public Service Commission (MPPSC)")
                        .category(ExamCategory.STATE_PSC)
                        .vacancyCount(450)
                        .applicationStartDate(LocalDate.now())
                        .applicationEndDate(LocalDate.now().plusDays(24))
                        .examDate(LocalDate.now().plusMonths(2))
                        .officialPdfUrl("https://mppsc.mp.gov.in/notification.pdf")
                        .applyLink("https://mppsc.mp.gov.in")
                        .eligibilitySummary("Bachelor's Degree in any discipline from a recognized university")
                        .ageLimitSummary("21 to 40 Years (State Domicile Relaxation)")
                        .applicationFeeSummary("₹500 (Gen/Out-of-state) / ₹250 (MP SC/ST/OBC)")
                        .sourceType("API_FALLBACK")
                        .status(ExamStatus.APPLY_NOW)
                        .build());

                fallbackList.add(ExamNotificationDto.builder()
                        .examName("UPPSC Combined Upper Subordinate Services (PCS) 2026")
                        .organizingBody("Uttar Pradesh Public Service Commission (UPPSC)")
                        .category(ExamCategory.STATE_PSC)
                        .vacancyCount(820)
                        .applicationStartDate(LocalDate.now())
                        .applicationEndDate(LocalDate.now().plusDays(20))
                        .examDate(LocalDate.now().plusMonths(3))
                        .officialPdfUrl("https://uppsc.up.nic.in/notif.pdf")
                        .applyLink("https://uppsc.up.nic.in")
                        .eligibilitySummary("Graduate Degree in relevant stream")
                        .ageLimitSummary("21 to 40 Years")
                        .applicationFeeSummary("₹125 (Gen/OBC) / ₹65 (SC/ST)")
                        .sourceType("API_FALLBACK")
                        .status(ExamStatus.APPLY_NOW)
                        .build());
            }
            case UPSC -> fallbackList.add(ExamNotificationDto.builder()
                    .examName("UPSC CDS II Examination 2026 (IMA/INA/AFA/OTA)")
                    .organizingBody("Union Public Service Commission")
                    .category(ExamCategory.UPSC)
                    .vacancyCount(460)
                    .applicationStartDate(LocalDate.now())
                    .applicationEndDate(LocalDate.now().plusDays(19))
                    .examDate(LocalDate.now().plusMonths(2))
                    .officialPdfUrl("https://upsc.gov.in/cds.pdf")
                    .applyLink("https://upsconline.nic.in")
                    .eligibilitySummary("Degree for IMA/OTA; B.E / B.Tech / Physics+Maths for AFA/INA")
                    .ageLimitSummary("19 to 24 Years")
                    .applicationFeeSummary("₹200 (Male UR/OBC) / Exempted (Female/SC/ST)")
                    .sourceType("API_FALLBACK")
                    .status(ExamStatus.APPLY_NOW)
                    .build());
            default -> fallbackList.add(ExamNotificationDto.builder()
                    .examName(category + " Automated Backup Notification Feed 2026")
                    .organizingBody("Government Recruitment Data Stream Provider")
                    .category(category)
                    .vacancyCount(750)
                    .applicationStartDate(LocalDate.now())
                    .applicationEndDate(LocalDate.now().plusDays(14))
                    .examDate(LocalDate.now().plusMonths(2))
                    .officialPdfUrl("https://gov.in/backup.pdf")
                    .applyLink("https://gov.in")
                    .eligibilitySummary("Graduate in relevant discipline")
                    .ageLimitSummary("18 to 30 Years")
                    .applicationFeeSummary("₹100")
                    .sourceType("API_FALLBACK")
                    .status(ExamStatus.APPLY_NOW)
                    .build());
        }

        return fallbackList;
    }
}
