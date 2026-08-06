package com.backend.autoapplypro.modules.users.controller;

import com.backend.autoapplypro.modules.users.dto.ContactRequestDto;
import com.backend.autoapplypro.modules.users.service.SystemEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/contact")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final SystemEmailService systemEmailService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitContactForm(@RequestBody ContactRequestDto request) {
        log.info("Received Contact Us form submission from email: {}", request.getEmail());

        if (request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Email and message content are required.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            systemEmailService.sendGeneralContactEmail(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thank you for reaching out! Your message has been received and our support team will respond shortly.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to process contact form submission", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "An error occurred while submitting your message. Please try sending directly to support@easynaukri.online.");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
