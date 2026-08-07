package com.backend.autoapplypro.modules.feedback.controller;

import com.backend.autoapplypro.modules.feedback.dto.FeedbackRequestDto;
import com.backend.autoapplypro.modules.feedback.dto.FeedbackResponseDto;
import com.backend.autoapplypro.modules.feedback.dto.FeedbackStatusResponse;
import com.backend.autoapplypro.modules.feedback.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponseDto> submitFeedback(
            Authentication authentication,
            @Valid @RequestBody FeedbackRequestDto requestDto) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) authentication.getCredentials();
        try {
            FeedbackResponseDto responseDto = feedbackService.submitFeedback(userId, requestDto);
            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackResponseDto>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @GetMapping("/public")
    public ResponseEntity<List<FeedbackResponseDto>> getPublicFeedbacks() {
        return ResponseEntity.ok(feedbackService.getPublicFeedbacks());
    }

    @GetMapping("/status")
    public ResponseEntity<FeedbackStatusResponse> getFeedbackStatus(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = (Long) authentication.getCredentials();
        try {
            FeedbackStatusResponse response = feedbackService.getFeedbackStatus(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
