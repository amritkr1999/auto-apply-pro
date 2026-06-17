package com.backend.autoapplypro.modules.outreach.controller;

import com.backend.autoapplypro.modules.outreach.dto.OutreachDraftDto;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drafts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OutreachDraftController {

    private final EmailQueueRepository emailQueueRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<OutreachDraftDto> saveDraft(@RequestBody OutreachDraftDto dto) {
        log.info("Received request to queue email draft to: {}", dto.getRecipientEmail());

        // Find or create default candidate user for testing/dev phase as auth is bypassed
        User user = userRepository.findAll().stream()
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

        // Build queue entity
        EmailQueue queueItem = EmailQueue.builder()
                .user(user)
                .recipientEmail(dto.getRecipientEmail())
                .subject(dto.getSubject())
                .body(dto.getBody())
                .status(OutreachStatus.PENDING)
                .build();

        EmailQueue saved = emailQueueRepository.save(queueItem);
        log.info("Saved queue item to database with ID: {}", saved.getId());

        // Return the input dto or updated dto
        dto.setId(saved.getId().toString());
        dto.setStatus(saved.getStatus().name());
        return ResponseEntity.ok(dto);
    }
}
