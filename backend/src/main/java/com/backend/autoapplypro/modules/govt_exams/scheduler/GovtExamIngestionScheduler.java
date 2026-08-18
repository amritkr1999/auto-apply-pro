package com.backend.autoapplypro.modules.govt_exams.scheduler;

import com.backend.autoapplypro.modules.govt_exams.service.GovtExamIngestionService;
import com.backend.autoapplypro.modules.govt_exams.service.GovtExamQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class GovtExamIngestionScheduler {

    private final GovtExamIngestionService ingestionService;
    private final GovtExamQueryService queryService;

    /**
     * Autonomous Hands-Free Background Ingestion Task.
     * Executes every 3 hours (10,800,000 ms).
     */
    @Scheduled(fixedRate = 10800000, initialDelay = 10000)
    public void runScheduledIngestionTask() {
        log.info("[GOVT EXAMS BACKGROUND SCHEDULER] Triggering scheduled autonomous ingestion cycle...");
        try {
            Map<String, Object> result = ingestionService.executeAutonomousIngestionPipeline();
            log.info("[GOVT EXAMS BACKGROUND SCHEDULER SUCCESS] Result: {}", result);
        } catch (Exception e) {
            log.error("[GOVT EXAMS BACKGROUND SCHEDULER ERROR] Ingestion cycle failed: {}", e.getMessage(), e);
        }
    }

    /**
     * Daily Status Maintenance Worker.
     * Runs at 01:00 AM every night to mark expired deadlines as CLOSED.
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void runDailyStatusUpdateTask() {
        log.info("[GOVT EXAMS DAILY SCHEDULER] Running daily application status maintenance task...");
        try {
            queryService.updateExpiredExamStatuses();
        } catch (Exception e) {
            log.error("[GOVT EXAMS DAILY SCHEDULER ERROR] Failed to update expired statuses: {}", e.getMessage(), e);
        }
    }
}
