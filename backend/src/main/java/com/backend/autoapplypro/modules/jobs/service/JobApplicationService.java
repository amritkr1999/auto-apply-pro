package com.backend.autoapplypro.modules.jobs.service;

import com.backend.autoapplypro.modules.jobs.dto.JobApplicationStatsDto;
import com.backend.autoapplypro.modules.jobs.model.JobApplication;
import com.backend.autoapplypro.modules.jobs.repository.JobApplicationRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final UserRepository userRepository;

    public List<JobApplication> getApplicationsForUser(Long userId) {
        log.info("Fetching job applications for user ID: {}", userId);
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public JobApplication createApplication(Long userId, JobApplication application) {
        log.info("Creating new job application for user ID: {} - {} at {}", userId, application.getJobTitle(), application.getCompanyName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        application.setUser(user);
        if (application.getStatus() == null) {
            application.setStatus("WISHLIST");
        }
        if (application.getAppliedAt() == null && "APPLIED".equalsIgnoreCase(application.getStatus())) {
            application.setAppliedAt(LocalDateTime.now());
        }
        return repository.save(application);
    }

    @Transactional
    public JobApplication updateApplicationStatus(Long id, String status) {
        log.info("Updating status of job application ID: {} to {}", id, status);
        JobApplication application = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job application not found with ID: " + id));
        
        application.setStatus(status.toUpperCase());
        if ("APPLIED".equalsIgnoreCase(status) && application.getAppliedAt() == null) {
            application.setAppliedAt(LocalDateTime.now());
        }
        return repository.save(application);
    }

    @Transactional
    public JobApplication updateApplication(Long id, JobApplication updated) {
        log.info("Updating details of job application ID: {}", id);
        JobApplication existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job application not found with ID: " + id));

        existing.setCompanyName(updated.getCompanyName());
        existing.setJobTitle(updated.getJobTitle());
        existing.setSourcePlatform(updated.getSourcePlatform());
        existing.setStatus(updated.getStatus() != null ? updated.getStatus().toUpperCase() : existing.getStatus());
        existing.setCurrentRound(updated.getCurrentRound());
        existing.setLocation(updated.getLocation());
        existing.setSalaryDetails(updated.getSalaryDetails());
        existing.setJobUrl(updated.getJobUrl());
        existing.setNotes(updated.getNotes());
        existing.setFollowUpDate(updated.getFollowUpDate());
        
        if (updated.getAppliedAt() != null) {
            existing.setAppliedAt(updated.getAppliedAt());
        } else if ("APPLIED".equalsIgnoreCase(existing.getStatus()) && existing.getAppliedAt() == null) {
            existing.setAppliedAt(LocalDateTime.now());
        }

        return repository.save(existing);
    }

    @Transactional
    public void deleteApplication(Long id) {
        log.info("Deleting job application ID: {}", id);
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Job application not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    public JobApplicationStatsDto getStatsForUser(Long userId) {
        log.info("Aggregating job application stats for user ID: {}", userId);
        List<JobApplication> apps = repository.findByUserId(userId);
        
        long totalApps = apps.size();
        long activeApps = apps.stream().filter(a -> !"WISHLIST".equalsIgnoreCase(a.getStatus())).count();
        long interviews = apps.stream().filter(a -> "INTERVIEWING".equalsIgnoreCase(a.getStatus())).count();
        long offers = apps.stream().filter(a -> "OFFER".equalsIgnoreCase(a.getStatus())).count();
        long rejections = apps.stream().filter(a -> "REJECTED".equalsIgnoreCase(a.getStatus())).count();
        
        long responses = interviews + offers + rejections;
        double overallResponseRate = activeApps > 0 ? ((double) responses / activeApps) * 100.0 : 0.0;
        overallResponseRate = Math.round(overallResponseRate * 10.0) / 10.0;

        Map<String, Long> platformTotal = new HashMap<>();
        Map<String, Long> platformResponses = new HashMap<>();

        for (JobApplication a : apps) {
            if ("WISHLIST".equalsIgnoreCase(a.getStatus())) {
                continue;
            }
            String platform = a.getSourcePlatform();
            if (platform == null || platform.trim().isEmpty()) {
                platform = "Other";
            }
            platform = platform.trim();
            platformTotal.put(platform, platformTotal.getOrDefault(platform, 0L) + 1);

            if ("INTERVIEWING".equalsIgnoreCase(a.getStatus()) ||
                "OFFER".equalsIgnoreCase(a.getStatus()) ||
                "REJECTED".equalsIgnoreCase(a.getStatus())) {
                platformResponses.put(platform, platformResponses.getOrDefault(platform, 0L) + 1);
            }
        }

        Map<String, Double> platformResponseRates = new HashMap<>();
        for (String platform : platformTotal.keySet()) {
            long pTotal = platformTotal.get(platform);
            long pResp = platformResponses.getOrDefault(platform, 0L);
            double rate = pTotal > 0 ? ((double) pResp / pTotal) * 100.0 : 0.0;
            rate = Math.round(rate * 10.0) / 10.0;
            platformResponseRates.put(platform, rate);
        }

        return JobApplicationStatsDto.builder()
                .totalApplications(totalApps)
                .activeInterviews(interviews)
                .offersReceived(offers)
                .rejectionsCount(rejections)
                .overallResponseRate(overallResponseRate)
                .platformResponseRates(platformResponseRates)
                .platformApplicationsCount(platformTotal)
                .build();
    }

    @Transactional
    public void createApplicationFromOutreach(User user, String recipientEmail, String subject) {
        try {
            log.info("Auto-logging application from outreach to: {}", recipientEmail);
            
            // 1. Try to extract company name from email domain
            String company = "Unknown Company";
            if (recipientEmail != null && recipientEmail.contains("@")) {
                String domain = recipientEmail.substring(recipientEmail.indexOf("@") + 1);
                int dotIndex = domain.indexOf(".");
                if (dotIndex > 0) {
                    String rawCompany = domain.substring(0, dotIndex);
                    company = rawCompany.substring(0, 1).toUpperCase() + rawCompany.substring(1);
                    if ("gmail".equalsIgnoreCase(company) || "yahoo".equalsIgnoreCase(company) || "outlook".equalsIgnoreCase(company) || "hotmail".equalsIgnoreCase(company)) {
                        company = "Unknown Company";
                    }
                }
            }

            // 2. Try to extract job title from subject
            String title = "Software Engineer"; // fallback
            if (subject != null) {
                String lowerSubject = subject.toLowerCase();
                if (lowerSubject.contains("application for")) {
                    int start = lowerSubject.indexOf("application for") + "application for".length();
                    int end = subject.length();
                    if (subject.contains("|")) {
                        end = subject.indexOf("|");
                    } else if (subject.contains("-")) {
                        end = subject.indexOf("-");
                    } else if (lowerSubject.contains(" at ")) {
                        end = lowerSubject.indexOf(" at ");
                    }
                    if (end > start) {
                        title = subject.substring(start, end).trim();
                    }
                }
            }

            if (title.isEmpty()) {
                title = "Software Engineer";
            }

            JobApplication app = JobApplication.builder()
                    .user(user)
                    .companyName(company)
                    .jobTitle(title)
                    .sourcePlatform("Email Outreach")
                    .status("APPLIED")
                    .appliedAt(LocalDateTime.now())
                    .notes("Automatically logged from cold email outreach to " + recipientEmail)
                    .build();

            repository.save(app);
            log.info("Auto-logged application: {} at {} via Email Outreach", title, company);
        } catch (Exception e) {
            log.error("Failed to auto-log application from outreach email", e);
        }
    }
}
