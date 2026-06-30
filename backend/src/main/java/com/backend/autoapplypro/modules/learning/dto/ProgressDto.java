package com.backend.autoapplypro.modules.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressDto {
    private int totalQuestions;
    private int solvedQuestions;
    private int totalResources;
    private int completedResources;
    private double overallPercentage;
    private List<TopicProgressDetail> topicProgress;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicProgressDetail {
        private Long topicId;
        private String topicName;
        private int solvedQuestions;
        private int totalQuestions;
        private int completedResources;
        private int totalResources;
        private double percentage;
    }
}
