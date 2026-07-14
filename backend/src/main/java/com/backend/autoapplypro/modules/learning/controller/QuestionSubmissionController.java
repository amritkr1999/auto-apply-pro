package com.backend.autoapplypro.modules.learning.controller;

import com.backend.autoapplypro.modules.learning.dto.AdminReviewRequestDto;
import com.backend.autoapplypro.modules.learning.dto.QuestionSubmissionRequestDto;
import com.backend.autoapplypro.modules.learning.dto.QuestionSubmissionResponseDto;
import com.backend.autoapplypro.modules.learning.service.QuestionSubmissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/learning/submissions")
@RequiredArgsConstructor
@Slf4j
public class QuestionSubmissionController {

    private final QuestionSubmissionService submissionService;

    @PostMapping
    public ResponseEntity<QuestionSubmissionResponseDto> submitQuestion(
            @RequestBody QuestionSubmissionRequestDto dto,
            Authentication authentication) {
        String email = authentication.getName();
        log.info("Request by {} to submit question '{}'", email, dto.getTitle());
        return ResponseEntity.ok(submissionService.submitQuestion(dto, email));
    }

    @GetMapping("/my")
    public ResponseEntity<List<QuestionSubmissionResponseDto>> getUserSubmissions(
            Authentication authentication) {
        String email = authentication.getName();
        log.info("Request by {} to fetch their question submissions", email);
        return ResponseEntity.ok(submissionService.getUserSubmissions(email));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<QuestionSubmissionResponseDto>> getPendingSubmissions(
            Authentication authentication) {
        String email = authentication.getName();
        log.info("Admin {} requesting pending question submissions", email);
        return ResponseEntity.ok(submissionService.getPendingSubmissions());
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<QuestionSubmissionResponseDto> reviewSubmission(
            @PathVariable Long id,
            @RequestBody AdminReviewRequestDto dto,
            Authentication authentication) {
        String email = authentication.getName();
        log.info("Admin {} reviewing submission {} with status {}", email, id, dto.getStatus());
        return ResponseEntity.ok(submissionService.reviewSubmission(id, dto, email));
    }
}
