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
public class OutreachDraftController {

    private final EmailQueueRepository emailQueueRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final OutreachSchedulerService schedulerService;
    private final com.backend.autoapplypro.modules.outreach.service.EmailService emailService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateEmail(
            @RequestBody EmailGenerationRequestDto dto,
            @RequestParam(value = "regenerate", required = false, defaultValue = "false") boolean regenerate) {
        log.info("Received request to generate outreach email for user: {} for job: {}, regenerate: {}", 
                dto.getUserId(), dto.getJobDetails().getTitle(), regenerate);

        try {
            EmailGenerationResponseDto response = emailService.generateEmail(dto, regenerate);
            return ResponseEntity.ok(response);
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

    @GetMapping("/llm-stats")
    public ResponseEntity<?> getLlmStats() {
        log.info("Secure endpoint: admin requested LLM token and cost telemetry statistics");
        try {
            java.util.Map<String, Object> stats = emailService.getLlmStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to fetch LLM stats", e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve LLM stats: " + e.getMessage());
        }
    }
}
