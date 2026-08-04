package com.backend.autoapplypro.modules.outreach.controller;

import com.backend.autoapplypro.modules.outreach.dto.TrialEmailRequestDto;
import com.backend.autoapplypro.modules.outreach.dto.TrialEmailResponseDto;
import com.backend.autoapplypro.modules.outreach.service.TrialEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/outreach/trial-email")
@RequiredArgsConstructor
@Slf4j
public class TrialEmailController {

    private final TrialEmailService trialEmailService;

    @PostMapping
    public ResponseEntity<?> sendTrialEmail(Authentication authentication, @RequestBody TrialEmailRequestDto request) {
        log.info("Received HTTP request to send trial email");

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        Long callerUserId = (Long) authentication.getCredentials();
        if (callerUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid authentication session");
        }

        try {
            TrialEmailResponseDto response = trialEmailService.sendTrialEmail(callerUserId, request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Failed to execute trial email dispatch for user ID: {}", callerUserId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(TrialEmailResponseDto.builder()
                            .success(false)
                            .message("Internal server error: " + e.getMessage())
                            .build());
        }
    }
}
