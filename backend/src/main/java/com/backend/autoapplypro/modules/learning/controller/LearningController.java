package com.backend.autoapplypro.modules.learning.controller;

import com.backend.autoapplypro.modules.learning.dto.*;
import com.backend.autoapplypro.modules.learning.service.LearningService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/learning")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class LearningController {

    private final LearningService learningService;

    @GetMapping("/topics")
    public ResponseEntity<List<TopicResponseDto>> getAllTopics() {
        log.info("Fetching all topics hierarchy");
        return ResponseEntity.ok(learningService.getAllTopicsHierarchy());
    }

    @GetMapping("/topics/{topicId}/resources")
    public ResponseEntity<List<ResourceDto>> getResources(
            @PathVariable Long topicId,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("Fetching resources for topic ID: {} for user: {}", topicId, email);
        return ResponseEntity.ok(learningService.getResourcesForTopic(topicId, email));
    }

    @GetMapping("/topics/{topicId}/questions")
    public ResponseEntity<List<PracticeQuestionDto>> getQuestions(
            @PathVariable Long topicId,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("Fetching questions for topic ID: {} for user: {}", topicId, email);
        return ResponseEntity.ok(learningService.getQuestionsForTopic(topicId, email));
    }

    @PostMapping("/questions/{questionId}/submit")
    public ResponseEntity<SubmitResponseDto> submitAnswer(
            @PathVariable Long questionId,
            @RequestBody QuestionSubmitDto submitDto,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("Submitting answer for question ID: {} for user: {}", questionId, email);
        return ResponseEntity.ok(learningService.submitAnswer(questionId, submitDto.getAnswer(), email));
    }

    @PostMapping("/resources/{resourceId}/complete")
    public ResponseEntity<Map<String, Boolean>> toggleResource(
            @PathVariable Long resourceId,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("Toggling resource completion for ID: {} for user: {}", resourceId, email);
        boolean completed = learningService.toggleResourceCompletion(resourceId, email);
        return ResponseEntity.ok(Map.of("completed", completed));
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyContentDto> getDailyContent(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("Fetching daily content for user: {}", email);
        return ResponseEntity.ok(learningService.getDailyContent(email));
    }

    @GetMapping("/progress")
    public ResponseEntity<ProgressDto> getProgress(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("Fetching progress for user: {}", email);
        return ResponseEntity.ok(learningService.getProgress(email));
    }

    @GetMapping("/roadmaps")
    public ResponseEntity<List<RoadmapResponseDto>> getAllRoadmaps(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("Fetching all roadmaps for user: {}", email);
        return ResponseEntity.ok(learningService.getAllRoadmaps(email));
    }

    @GetMapping("/roadmaps/{roadmapId}")
    public ResponseEntity<RoadmapResponseDto> getRoadmapById(
            @PathVariable Long roadmapId,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        log.info("Fetching roadmap details for ID: {} for user: {}", roadmapId, email);
        return ResponseEntity.ok(learningService.getRoadmapById(roadmapId, email));
    }
}
