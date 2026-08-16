package com.backend.autoapplypro.modules.jobs.service;

import com.backend.autoapplypro.modules.hr.HrDetails;
import com.backend.autoapplypro.modules.hr.HrRepository;
import com.backend.autoapplypro.modules.jobs.dto.ClientScrapePayloadDto;
import com.backend.autoapplypro.modules.jobs.dto.JobPostingFeedDto;
import com.backend.autoapplypro.modules.jobs.dto.ScrapedItemDto;
import com.backend.autoapplypro.modules.jobs.model.JobPosting;
import com.backend.autoapplypro.modules.jobs.repository.JobPostingRepository;
import com.backend.autoapplypro.modules.users.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClientScraperServiceImpl implements ClientScraperService {

    private final HrRepository hrRepository;
    private final JobPostingRepository jobPostingRepository;

    @Override
    public Map<String, Object> processClientScrapePayload(ClientScrapePayloadDto payload, User user) {
        log.info("Processing client scrape payload from node: {}, user ID: {}, item count: {}",
                payload.getClientNodeId(), user != null ? user.getId() : "anonymous",
                payload.getItems() != null ? payload.getItems().size() : 0);

        int newHrCount = 0;
        int skippedHrCount = 0;
        int newJobCount = 0;

        if (payload.getItems() != null && !payload.getItems().isEmpty()) {
            for (ScrapedItemDto item : payload.getItems()) {
                // 1. Permanent HR details extraction & deduplication
                if (item.getHrEmail() != null && item.getHrEmail().contains("@")) {
                    String cleanEmail = item.getHrEmail().trim().toLowerCase();
                    // Basic email sanity check
                    if (isValidEmail(cleanEmail)) {
                        Optional<HrDetails> existingHr = hrRepository.findByEmailIgnoreCase(cleanEmail);
                        if (existingHr.isEmpty()) {
                            String name = item.getHrName() != null && !item.getHrName().isBlank() ? item.getHrName().trim() : "Hiring Team";
                            String company = item.getCompany() != null && !item.getCompany().isBlank() ? item.getCompany().trim() : "Unknown Company";
                            String title = item.getHrTitle() != null && !item.getHrTitle().isBlank() ? item.getHrTitle().trim() : "Recruiter";
                            
                            HrDetails newHr = HrDetails.builder()
                                    .name(name)
                                    .email(cleanEmail)
                                    .companyName(company)
                                    .phoneNumber(item.getHrPhone())
                                    .notes("Title: " + title + " | Source: Client Harvester Node")
                                    .build();
                            
                            hrRepository.save(newHr);
                            newHrCount++;
                        } else {
                            skippedHrCount++;
                        }
                    }
                }

                // 2. 20-Day retention Job Posting Feed storage
                if (item.getTitle() != null && !item.getTitle().isBlank() &&
                    item.getCompany() != null && !item.getCompany().isBlank()) {
                    
                    String title = item.getTitle().trim();
                    String company = item.getCompany().trim();

                    Optional<JobPosting> existingJob = jobPostingRepository.findByTitleAndCompany(title, company);
                    if (existingJob.isEmpty()) {
                        JobPosting jobPosting = JobPosting.builder()
                                .title(title)
                                .company(company)
                                .location(item.getLocation() != null ? item.getLocation().trim() : "Remote / Unspecified")
                                .description(item.getDescription())
                                .requirements(item.getRequirements())
                                .salary(item.getSalary())
                                .sourceUrl(item.getSourceUrl())
                                .hrEmail(item.getHrEmail())
                                .hrEmails(item.getHrEmail())
                                .build();
                        
                        jobPostingRepository.save(jobPosting);
                        newJobCount++;
                    }
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("newHrContactsAdded", newHrCount);
        result.put("existingHrContactsSkipped", skippedHrCount);
        result.put("newJobPostingsAdded", newJobCount);
        result.put("message", String.format("Processed payload. Added %d new HR contacts & %d job postings.", newHrCount, newJobCount));
        
        return result;
    }

    @Override
    public List<JobPostingFeedDto> getLatestJobPostingFeed(int page, int size) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(20);
        List<JobPosting> jobList = jobPostingRepository.findByCreatedAtAfterOrderByCreatedAtDesc(cutoff, PageRequest.of(page, size));
        
        return jobList.stream().map(job -> {
            long daysAgo = 0;
            if (job.getCreatedAt() != null) {
                daysAgo = ChronoUnit.DAYS.between(job.getCreatedAt(), LocalDateTime.now());
            }
            return JobPostingFeedDto.builder()
                    .id(job.getId())
                    .title(job.getTitle())
                    .company(job.getCompany())
                    .location(job.getLocation())
                    .description(job.getDescription())
                    .requirements(job.getRequirements())
                    .salary(job.getSalary())
                    .sourceUrl(job.getSourceUrl())
                    .hrEmail(job.getHrEmail())
                    .createdAt(job.getCreatedAt())
                    .daysAgo(daysAgo)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<String> getClientTasksForUser(User user) {
        List<String> tasks = new ArrayList<>();
        if (user != null && user.getHrOutreachTargetRole() != null && !user.getHrOutreachTargetRole().isBlank()) {
            tasks.add(user.getHrOutreachTargetRole().trim());
        }
        
        // Add standard tech keywords as default fallback tasks
        tasks.addAll(Arrays.asList(
                "Full Stack Developer",
                "Java Backend Engineer",
                "Frontend Developer React",
                "Software Engineer",
                "DevOps Engineer",
                "Data Engineer"
        ));
        
        return tasks.stream().distinct().collect(Collectors.toList());
    }

    private boolean isValidEmail(String email) {
        if (email == null || email.isBlank()) return false;
        String lower = email.toLowerCase();
        // Ignore generic/invalid addresses
        if (lower.startsWith("support@") || lower.startsWith("info@") || lower.startsWith("no-reply@") || lower.startsWith("noreply@") || lower.startsWith("careers@")) {
            return false;
        }
        return lower.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$");
    }
}
