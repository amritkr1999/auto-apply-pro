package com.backend.autoapplypro.modules.outreach.controller;

import com.backend.autoapplypro.modules.outreach.dto.DailyDigestDto;
import com.backend.autoapplypro.modules.outreach.service.DailyDigestService;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/outreach/digest")
@RequiredArgsConstructor
@Slf4j
public class DailyDigestController {

    private final DailyDigestService dailyDigestService;
    private final UserRepository userRepository;

    @GetMapping("/preferences")
    public ResponseEntity<?> getDigestPreferences(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) authentication.getCredentials();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(Map.of(
                "dailyDigestEnabled", user.getDailyDigestEnabled() != null ? user.getDailyDigestEnabled() : true,
                "dailyDigestTime", user.getDailyDigestTime() != null ? user.getDailyDigestTime().toString() : "20:00",
                "outreachTimezone", user.getOutreachTimezone() != null ? user.getOutreachTimezone() : "UTC",
                "lastDigestSentDate", user.getLastDigestSentDate() != null ? user.getLastDigestSentDate().toString() : ""
        ));
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updateDigestPreferences(
            Authentication authentication,
            @RequestBody DigestPreferencesRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) authentication.getCredentials();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getDailyDigestEnabled() != null) {
            user.setDailyDigestEnabled(request.getDailyDigestEnabled());
        }

        if (request.getDailyDigestTime() != null && !request.getDailyDigestTime().trim().isEmpty()) {
            try {
                user.setDailyDigestTime(LocalTime.parse(request.getDailyDigestTime()));
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid time format. Expected HH:mm"));
            }
        }

        userRepository.save(user);
        log.info("Updated Daily EOD Digest preferences for user ID {}", userId);

        return ResponseEntity.ok(Map.of(
                "message", "Digest preferences updated successfully",
                "dailyDigestEnabled", user.getDailyDigestEnabled(),
                "dailyDigestTime", user.getDailyDigestTime().toString()
        ));
    }

    @PostMapping("/test")
    public ResponseEntity<?> sendTestDigest(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) authentication.getCredentials();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        boolean success = dailyDigestService.sendDailyDigestForUser(user, LocalDate.now());
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Daily EOD Digest test email sent successfully to " + user.getEmail()));
        } else {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to dispatch test digest email"));
        }
    }

    @GetMapping("/preview")
    public ResponseEntity<?> previewDigest(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) authentication.getCredentials();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        DailyDigestDto digestDto = dailyDigestService.generateDailyDigest(user, LocalDate.now());
        return ResponseEntity.ok(digestDto);
    }

    @Data
    public static class DigestPreferencesRequest {
        private Boolean dailyDigestEnabled;
        private String dailyDigestTime;
    }
}
