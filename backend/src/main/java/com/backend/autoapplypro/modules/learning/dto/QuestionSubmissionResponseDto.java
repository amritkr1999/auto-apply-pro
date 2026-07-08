package com.backend.autoapplypro.modules.learning.dto;

import com.backend.autoapplypro.modules.learning.model.DifficultyLevel;
import com.backend.autoapplypro.modules.learning.model.QuestionSubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionSubmissionResponseDto {
    private Long id;
    private String title;
    private String content;
    private DifficultyLevel difficulty;
    private List<String> choices;
    private String correctAnswer;
    private String explanation;
    private Long subjectId;
    private String subjectName;
    private Long topicId;
    private String topicName;
    private String submittedByEmail;
    private String submittedByName;
    private QuestionSubmissionStatus status;
    private String adminFeedback;
    private String reviewedByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
