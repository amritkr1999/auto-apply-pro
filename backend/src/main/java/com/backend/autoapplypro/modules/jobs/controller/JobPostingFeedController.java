package com.backend.autoapplypro.modules.jobs.controller;

import com.backend.autoapplypro.modules.jobs.dto.JobPostingFeedDto;
import com.backend.autoapplypro.modules.jobs.service.ClientScraperService;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/jobs/postings")
@RequiredArgsConstructor
@Slf4j
public class JobPostingFeedController {

    private final ClientScraperService clientScraperService;
    private final EmailQueueRepository emailQueueRepository;
    private final UserRepository userRepository;

    @Data
    public static class QueueJobEmailRequest {
        private Long jobId;
        private String title;
        private String company;
        private String hrEmail;
    }

    /**
     * Retrieves the latest active job postings from the past 20 days.
     */
    @GetMapping("/latest")
    public ResponseEntity<List<JobPostingFeedDto>> getLatestJobFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        List<JobPostingFeedDto> feed = clientScraperService.getLatestJobPostingFeed(page, size);
        return ResponseEntity.ok(feed);
    }

    /**
     * Adds an outreach email directly to the sending queue for the HR of a job posting.
     */
    @PostMapping("/queue-email")
    public ResponseEntity<Map<String, Object>> queueHrEmail(@RequestBody QueueJobEmailRequest req) {
        log.info("Request to queue email to HR: {} for job: {} at {}", req.getHrEmail(), req.getTitle(), req.getCompany());

        if (req.getHrEmail() == null || req.getHrEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No HR email address listed for this job."));
        }

        User user = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.CANDIDATE)
                .findFirst()
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email("candidate@easynaukri.com")
                            .passwordHash("$2a$10$abcdefghijklmnopqrstuv")
                            .role(UserRole.CANDIDATE)
                            .name("Active Candidate")
                            .mobile("9876543210")
                            .build();
                    return userRepository.save(newUser);
                });

        String title = req.getTitle() != null ? req.getTitle() : "Software Engineer";
        String company = req.getCompany() != null ? req.getCompany() : "Hiring Company";
        String subject = "Application for " + title + " Position - " + user.getName();
        String body = "Dear Hiring Team,\n\n" +
                "I am writing to express my strong interest in the " + title + " role at " + company + ".\n\n" +
                "With my hands-on experience building scalable applications, microservices, and robust software architectures, I am confident I can add immediate value to your engineering team.\n\n" +
                "I have attached my resume for your review. I would welcome the opportunity to discuss how my technical skills align with your hiring goals.\n\n" +
                "Best regards,\n" +
                user.getName() + "\n" +
                "Email: " + user.getEmail();

        EmailQueue queueItem = EmailQueue.builder()
                .user(user)
                .recipientEmail(req.getHrEmail().trim().toLowerCase())
                .subject(subject)
                .body(body)
                .status(OutreachStatus.PENDING)
                .scheduledAt(java.time.LocalDateTime.now().plusMinutes(5))
                .build();

        EmailQueue saved = emailQueueRepository.save(queueItem);
        log.info("Successfully queued email ID: {} to recipient: {}", saved.getId(), saved.getRecipientEmail());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Queued email to " + saved.getRecipientEmail() + " successfully!",
                "queueId", saved.getId(),
                "recipientEmail", saved.getRecipientEmail()
        ));
    }
}
