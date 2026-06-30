package com.backend.autoapplypro.modules.outreach.controller;

import com.backend.autoapplypro.modules.outreach.dto.OutreachDraftDto;
import com.backend.autoapplypro.modules.outreach.dto.EmailGenerationRequestDto;
import com.backend.autoapplypro.modules.outreach.dto.EmailGenerationResponseDto;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.service.UserService;
import com.backend.autoapplypro.modules.outreach.service.OutreachSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drafts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OutreachDraftController {

    private final EmailQueueRepository emailQueueRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final OutreachSchedulerService schedulerService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateEmail(@RequestBody EmailGenerationRequestDto dto) {
        log.info("Received request to generate outreach email for user: {} for job: {}", dto.getUserId(), dto.getJobDetails().getTitle());

        try {
            // 1. Get Candidate Profile DTO
            com.backend.autoapplypro.modules.users.dto.CandidateProfileDto profile = userService.getCandidateProfile(dto.getUserId());

            // 2. Build the request payload for Python FastAPI service
            java.util.Map<String, Object> pythonPayload = new java.util.HashMap<>();

            // Map Job Details
            java.util.Map<String, Object> jobDetailsMap = new java.util.HashMap<>();
            jobDetailsMap.put("job_title", dto.getJobDetails().getTitle());
            jobDetailsMap.put("company", dto.getJobDetails().getCompany());
            jobDetailsMap.put("skills", dto.getJobDetails().getSkills() != null ? dto.getJobDetails().getSkills() : java.util.Collections.emptyList());
            jobDetailsMap.put("location", dto.getJobDetails().getLocation());
            jobDetailsMap.put("job_type", "Full-time"); // default fallback or parse if available

            // Extract recruiter email from DTO, or fallback to description if missing
            String recruiterEmail = null;
            if (dto.getJobDetails().getHrEmails() != null && !dto.getJobDetails().getHrEmails().isEmpty()) {
                recruiterEmail = dto.getJobDetails().getHrEmails().get(0);
            }
            if (recruiterEmail == null || recruiterEmail.trim().isEmpty()) {
                recruiterEmail = "recruiter@example.com";
                if (dto.getJobDetails().getDescription() != null) {
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}");
                    java.util.regex.Matcher matcher = pattern.matcher(dto.getJobDetails().getDescription());
                    if (matcher.find()) {
                        recruiterEmail = matcher.group();
                    }
                }
            }
            jobDetailsMap.put("recruiter_email", recruiterEmail);
            pythonPayload.put("job_details", jobDetailsMap);

            // Map Candidate Profile
            java.util.Map<String, Object> candidateMap = new java.util.HashMap<>();
            candidateMap.put("name", profile.getName());
            candidateMap.put("email", profile.getEmail());
            candidateMap.put("phone", profile.getMobile());
            candidateMap.put("skills", profile.getSkills() != null ? profile.getSkills() : java.util.Collections.emptyList());
            candidateMap.put("summary", profile.getSummary());
            
            // Map experience
            java.util.List<java.util.Map<String, Object>> expList = new java.util.ArrayList<>();
            if (profile.getExperience() != null) {
                for (java.util.Map<String, Object> exp : profile.getExperience()) {
                    java.util.Map<String, Object> expMap = new java.util.HashMap<>();
                    expMap.put("title", exp.get("title") != null ? exp.get("title") : "Software Engineer");
                    expMap.put("company", exp.get("company") != null ? exp.get("company") : "Unknown Company");
                    expMap.put("duration", exp.get("duration") != null ? exp.get("duration") : "N/A");
                    expMap.put("description", exp.get("description") != null ? exp.get("description") : "No description");
                    expList.add(expMap);
                }
            }
            candidateMap.put("experience", expList);
            pythonPayload.put("candidate", candidateMap);

            // 3. Make REST call to Python service
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String pythonServiceUrl = "http://localhost:8000/generate-email";

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

            org.springframework.http.HttpEntity<java.util.Map<String, Object>> requestEntity = 
                new org.springframework.http.HttpEntity<>(pythonPayload, headers);

            org.springframework.http.ResponseEntity<EmailGenerationResponseDto> response = restTemplate.postForEntity(
                pythonServiceUrl,
                requestEntity,
                EmailGenerationResponseDto.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            } else {
                return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Python service returned an error status.");
            }
        } catch (Exception e) {
            log.error("Failed to generate outreach email", e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate email: " + e.getMessage());
        }
    }

    @Transactional
    @PostMapping
    public ResponseEntity<OutreachDraftDto> saveDraft(@RequestBody OutreachDraftDto dto) {
        log.info("Received request to queue email draft to: {}", dto.getRecipientEmail());

        User user = null;
        if (dto.getUserId() != null) {
            user = userRepository.findById(dto.getUserId()).orElse(null);
        }
        if (user == null) {
            log.info("No user ID provided or found. Bypassing auth check for test/dev fallback.");
            user = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == UserRole.CANDIDATE)
                    .findFirst()
                    .orElseGet(() -> {
                        log.info("No candidate user found in database. Creating default candidate user.");
                        User newUser = User.builder()
                                .email("guest@example.com")
                                .passwordHash("$2a$10$abcdefghijklmnopqrstuv") // dummy password hash
                                .role(UserRole.CANDIDATE)
                                .name("Guest Developer")
                                .mobile("1234567890")
                                .build();
                        return userRepository.save(newUser);
                    });
        }

        OutreachStatus status = OutreachStatus.PENDING;
        if (dto.getStatus() != null) {
            try {
                status = OutreachStatus.valueOf(dto.getStatus());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status provided: {}, defaulting to PENDING", dto.getStatus());
            }
        }

        // Calculate next scheduled send time only if status is PENDING
        java.time.LocalDateTime scheduledAt = null;
        if (status == OutreachStatus.PENDING) {
            scheduledAt = schedulerService.calculateNextScheduleTime(user);
        }

        // Build queue entity
        EmailQueue queueItem = EmailQueue.builder()
                .user(user)
                .recipientEmail(dto.getRecipientEmail())
                .ccEmails(dto.getCcEmails())
                .parsedEmails(dto.getParsedEmails())
                .subject(dto.getSubject())
                .body(dto.getBody())
                .status(status)
                .scheduledAt(scheduledAt)
                .build();

        EmailQueue saved = emailQueueRepository.save(queueItem);
        log.info("Saved queue item to database with ID: {}, status: {}", saved.getId(), saved.getStatus());

        // Return the input dto or updated dto
        dto.setId(saved.getId().toString());
        dto.setStatus(saved.getStatus().name());
        dto.setCcEmails(saved.getCcEmails());
        dto.setParsedEmails(saved.getParsedEmails());
        dto.setScheduledAt(saved.getScheduledAt() != null ? saved.getScheduledAt().toString() : null);
        return ResponseEntity.ok(dto);
    }

    @Transactional
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAndApproveDraft(@PathVariable Long id, @RequestBody OutreachDraftDto dto) {
        log.info("Received request to update/approve email draft ID: {}", id);
        return emailQueueRepository.findById(id).map(item -> {
            item.setRecipientEmail(dto.getRecipientEmail());
            item.setCcEmails(dto.getCcEmails());
            item.setParsedEmails(dto.getParsedEmails());
            item.setSubject(dto.getSubject());
            item.setBody(dto.getBody());

            OutreachStatus newStatus = item.getStatus();
            if (dto.getStatus() != null) {
                try {
                    newStatus = OutreachStatus.valueOf(dto.getStatus());
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status provided: {}", dto.getStatus());
                }
            }

            // If transitioning to PENDING from DRAFT/other, schedule it
            if (newStatus == OutreachStatus.PENDING && item.getStatus() != OutreachStatus.PENDING) {
                item.setStatus(OutreachStatus.PENDING);
                item.setScheduledAt(schedulerService.calculateNextScheduleTime(item.getUser()));
            } else {
                item.setStatus(newStatus);
            }

            EmailQueue saved = emailQueueRepository.save(item);
            log.info("Updated draft ID: {}, status: {}", saved.getId(), saved.getStatus());

            OutreachDraftDto responseDto = OutreachDraftDto.builder()
                    .id(saved.getId().toString())
                    .recipientEmail(saved.getRecipientEmail())
                    .ccEmails(saved.getCcEmails())
                    .parsedEmails(saved.getParsedEmails())
                    .subject(saved.getSubject())
                    .body(saved.getBody())
                    .status(saved.getStatus().name())
                    .sentAt(saved.getSentAt() != null ? saved.getSentAt().toString() : null)
                    .scheduledAt(saved.getScheduledAt() != null ? saved.getScheduledAt().toString() : null)
                    .errorMessage(saved.getErrorMessage())
                    .userId(saved.getUser().getId())
                    .build();

            return ResponseEntity.ok(responseDto);
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDraft(@PathVariable Long id) {
        log.info("Received request to delete email draft ID: {}", id);
        if (emailQueueRepository.existsById(id)) {
            emailQueueRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Draft deleted successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getQueueItems(@PathVariable Long userId) {
        log.info("Fetching email queue items for user: {}", userId);
        try {
            java.util.List<EmailQueue> items = emailQueueRepository.findByUserId(userId);
            java.util.List<OutreachDraftDto> dtos = new java.util.ArrayList<>();
            for (EmailQueue item : items) {
                OutreachDraftDto dto = new OutreachDraftDto();
                dto.setId(item.getId().toString());
                dto.setRecipientEmail(item.getRecipientEmail());
                dto.setCcEmails(item.getCcEmails());
                dto.setParsedEmails(item.getParsedEmails());
                dto.setSubject(item.getSubject());
                dto.setBody(item.getBody());
                dto.setStatus(item.getStatus().name());
                dto.setSentAt(item.getSentAt() != null ? item.getSentAt().toString() : null);
                dto.setScheduledAt(item.getScheduledAt() != null ? item.getScheduledAt().toString() : null);
                dto.setErrorMessage(item.getErrorMessage());
                dto.setUserId(item.getUser().getId());
                dtos.add(dto);
            }
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Failed to fetch email queue items", e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch queue items: " + e.getMessage());
        }
    }
}
