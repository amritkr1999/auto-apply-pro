package com.backend.autoapplypro.modules.learning.service;

import com.backend.autoapplypro.modules.learning.dto.*;

import java.util.List;

public interface LearningService {
    List<TopicResponseDto> getAllTopicsHierarchy();
    List<ResourceDto> getResourcesForTopic(Long topicId, String userEmail);
    List<PracticeQuestionDto> getQuestionsForTopic(Long topicId, String userEmail);
    SubmitResponseDto submitAnswer(Long questionId, String answer, String userEmail);
    boolean toggleResourceCompletion(Long resourceId, String userEmail);
    DailyContentDto getDailyContent(String userEmail);
    ProgressDto getProgress(String userEmail);
    List<RoadmapResponseDto> getAllRoadmaps(String userEmail);
    RoadmapResponseDto getRoadmapById(Long roadmapId, String userEmail);
}
