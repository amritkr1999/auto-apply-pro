package com.backend.autoapplypro.modules.users.controller;

import com.backend.autoapplypro.modules.users.dto.CareersInterestRequestDto;
import com.backend.autoapplypro.modules.users.service.SystemEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/careers")
@RequiredArgsConstructor
@Slf4j
public class CareersController {

    private final SystemEmailService systemEmailService;

    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, Object>> subscribeToJobUpdates(@RequestBody CareersInterestRequestDto request) {
        log.info("Received Careers early interest subscription for email: {}", request != null ? request.getEmail() : null);

        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty() || !request.getEmail().contains("@")) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "A valid email address is required.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        String recipientEmail = request.getEmail().trim();

        try {
            systemEmailService.sendCareersInterestAcknowledgementEmail(recipientEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thank you! We have received your email. An acknowledgement email has been sent and you will be updated with all future job opening updates.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to process careers interest email subscription for: {}", recipientEmail, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while processing your request. Please try again later.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
