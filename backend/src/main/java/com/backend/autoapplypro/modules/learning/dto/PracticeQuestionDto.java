package com.backend.autoapplypro.modules.learning.dto;

import com.backend.autoapplypro.modules.learning.model.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeQuestionDto {
    private Long id;
    private String title;
    private String content;
    private DifficultyLevel difficulty;
    private List<String> choices;
    private boolean completed;
    private String topicName;
    private Double averageRating;
    private Integer totalRatings;
}

