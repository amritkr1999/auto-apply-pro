package com.backend.autoapplypro.modules.learning.controller;

import com.backend.autoapplypro.modules.learning.dto.QuestionRatingRequestDto;
import com.backend.autoapplypro.modules.learning.service.QuestionRatingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/learning/questions")
@RequiredArgsConstructor
@Slf4j
public class QuestionRatingController {

    private final QuestionRatingService ratingService;

    @PostMapping("/{id}/rate")
    public ResponseEntity<Map<String, String>> rateQuestion(
            @PathVariable Long id,
            @RequestBody QuestionRatingRequestDto dto,
            Authentication authentication) {
        String email = authentication.getName();
        log.info("Request by {} to rate question ID {} with score {}", email, id, dto.getRating());
        ratingService.rateQuestion(id, dto, email);
        return ResponseEntity.ok(Map.of("message", "Rating submitted successfully"));
    }
}
