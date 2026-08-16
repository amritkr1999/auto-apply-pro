package com.backend.autoapplypro.modules.jobs.scheduler;

import com.backend.autoapplypro.modules.jobs.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Slf4j
@RequiredArgsConstructor
public class JobPostingCleanupTask {

    private final JobPostingRepository jobPostingRepository;

    /**
     * Runs every day at 3:00 AM.
     * Deletes job postings older than 20 days to keep the job feed fresh.
     * Note: Recruiter records in hr_details remain untouched permanently.
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupExpiredJobPostings() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(20);
        log.info("Starting cleanup of job postings created before 20 days ago: {}", cutoff);
        try {
            jobPostingRepository.deleteChildSkillsBefore(cutoff);
            int deletedCount = jobPostingRepository.deleteByCreatedAtBefore(cutoff);
            log.info("Successfully cleaned up {} expired job postings. HR details in hr_details table remain intact.", deletedCount);
        } catch (Exception e) {
            log.error("Error occurred while cleaning up expired job postings: {}", e.getMessage(), e);
        }
    }
}
