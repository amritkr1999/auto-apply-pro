package com.backend.autoapplypro.modules.learning.service;

import com.backend.autoapplypro.modules.learning.dto.*;
import com.backend.autoapplypro.modules.learning.model.*;
import com.backend.autoapplypro.modules.learning.repository.*;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserActivityLog;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.repository.UserActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LearningServiceImpl implements LearningService {

    private final TopicRepository topicRepository;
    private final ResourceRepository resourceRepository;
    private final PracticeQuestionRepository questionRepository;
    private final DailyTipRepository dailyTipRepository;
    private final UserLearningProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final RoadmapRepository roadmapRepository;
    private final UserActivityLogRepository userActivityLogRepository;

    @Override
    public List<TopicResponseDto> getAllTopicsHierarchy() {
        List<Topic> rootTopics = topicRepository.findByParentTopicIsNull();
        return rootTopics.stream()
                .map(this::mapToTopicResponseDto)
                .collect(Collectors.toList());
    }

    private TopicResponseDto mapToTopicResponseDto(Topic topic) {
        return TopicResponseDto.builder()
                .id(topic.getId())
                .name(topic.getName())
                .description(topic.getDescription())
                .icon(topic.getIcon())
                .subtopics(topic.getSubtopics().stream()
                        .map(this::mapToTopicResponseDto)
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    public List<ResourceDto> getResourcesForTopic(Long topicId, String userEmail) {
        List<Resource> resources = resourceRepository.findByTopicId(topicId);
        Set<Long> completedIds = getCompletedResourceIds(userEmail);

        return resources.stream()
                .map(r -> ResourceDto.builder()
                        .id(r.getId())
                        .title(r.getTitle())
                        .url(r.getUrl())
                        .type(r.getType())
                        .description(r.getDescription())
                        .completed(completedIds.contains(r.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<PracticeQuestionDto> getQuestionsForTopic(Long topicId, String userEmail) {
        List<PracticeQuestion> questions = questionRepository.findByTopicId(topicId);
        Set<Long> completedIds = getCompletedQuestionIds(userEmail);

        return questions.stream()
                .map(q -> mapToQuestionDto(q, completedIds.contains(q.getId())))
                .collect(Collectors.toList());
    }

    private PracticeQuestionDto mapToQuestionDto(PracticeQuestion q, boolean completed) {
        return PracticeQuestionDto.builder()
                .id(q.getId())
                .title(q.getTitle())
                .content(q.getContent())
                .difficulty(q.getDifficulty())
                .choices(q.getChoices())
                .completed(completed)
                .topicName(q.getTopic() != null ? q.getTopic().getName() : "")
                .build();
    }

    @Override
    @Transactional
    public SubmitResponseDto submitAnswer(Long questionId, String answer, String userEmail) {
        PracticeQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with ID: " + questionId));

        boolean correct = question.getCorrectAnswer().trim().equalsIgnoreCase(answer.trim());

        if (correct) {
            UserLearningProgress progress = getOrCreateProgress(userEmail);
            progress.getCompletedQuestions().add(question);
            progressRepository.save(progress);

            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

            // Log QUESTION_SOLVED activity
            userActivityLogRepository.save(UserActivityLog.builder()
                    .user(user)
                    .activityType("QUESTION_SOLVED")
                    .activityDate(LocalDate.now())
                    .referenceId(questionId)
                    .build());

            // Check if topic is completed
            if (question.getTopic() != null) {
                checkAndLogTopicCompletion(user, question.getTopic());
            }
        }

        return SubmitResponseDto.builder()
                .correct(correct)
                .correctAnswer(question.getCorrectAnswer())
                .explanation(question.getExplanation())
                .build();
    }

    private void checkAndLogTopicCompletion(User user, Topic topic) {
        if (topic == null) return;

        List<Long> topicIds = new ArrayList<>();
        collectTopicIds(topic, topicIds);

        List<PracticeQuestion> topicQuestions = questionRepository.findAll().stream()
                .filter(q -> q.getTopic() != null && topicIds.contains(q.getTopic().getId()))
                .toList();

        List<Resource> topicResources = resourceRepository.findAll().stream()
                .filter(r -> r.getTopic() != null && topicIds.contains(r.getTopic().getId()))
                .toList();

        int topicTotalItems = topicQuestions.size() + topicResources.size();
        if (topicTotalItems == 0) return;

        Set<Long> completedQuestionIds = getCompletedQuestionIds(user.getEmail());
        Set<Long> completedResourceIds = getCompletedResourceIds(user.getEmail());

        long completedCount = topicQuestions.stream().filter(q -> completedQuestionIds.contains(q.getId())).count() +
                topicResources.stream().filter(r -> completedResourceIds.contains(r.getId())).count();

        if (completedCount == topicTotalItems) {
            boolean alreadyLogged = userActivityLogRepository.existsByUserIdAndActivityTypeAndReferenceId(
                    user.getId(), "TOPIC_COMPLETED", topic.getId());
            if (!alreadyLogged) {
                userActivityLogRepository.save(UserActivityLog.builder()
                        .user(user)
                        .activityType("TOPIC_COMPLETED")
                        .activityDate(LocalDate.now())
                        .referenceId(topic.getId())
                        .build());
                log.info("Logged TOPIC_COMPLETED for user ID {} and topic ID {}", user.getId(), topic.getId());
            }
        }
    }

    @Override
    @Transactional
    public boolean toggleResourceCompletion(Long resourceId, String userEmail) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found with ID: " + resourceId));

        UserLearningProgress progress = getOrCreateProgress(userEmail);
        boolean isCompletedNow;

        if (progress.getCompletedResources().contains(resource)) {
            progress.getCompletedResources().remove(resource);
            isCompletedNow = false;
        } else {
            progress.getCompletedResources().add(resource);
            isCompletedNow = true;
        }

        progressRepository.save(progress);

        if (isCompletedNow) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));
            if (resource.getTopic() != null) {
                checkAndLogTopicCompletion(user, resource.getTopic());
            }
        }

        return isCompletedNow;
    }

    @Override
    public DailyContentDto getDailyContent(String userEmail) {
        List<DailyTip> tips = dailyTipRepository.findAll();
        List<PracticeQuestion> questions = questionRepository.findAll();

        if (tips.isEmpty() || questions.isEmpty()) {
            return DailyContentDto.builder().build();
        }

        long todayEpoch = LocalDate.now().toEpochDay();
        
        int tipIndex = (int) (todayEpoch % tips.size());
        DailyTip selectedTip = tips.get(tipIndex);

        int questionIndex = (int) (todayEpoch % questions.size());
        PracticeQuestion selectedQuestion = questions.get(questionIndex);

        Set<Long> completedQuestionIds = getCompletedQuestionIds(userEmail);
        PracticeQuestionDto questionDto = mapToQuestionDto(selectedQuestion, completedQuestionIds.contains(selectedQuestion.getId()));

        return DailyContentDto.builder()
                .tip(selectedTip)
                .question(questionDto)
                .build();
    }

    @Override
    public ProgressDto getProgress(String userEmail) {
        long totalQuestions = questionRepository.count();
        long totalResources = resourceRepository.count();

        Set<Long> completedQuestionIds = getCompletedQuestionIds(userEmail);
        Set<Long> completedResourceIds = getCompletedResourceIds(userEmail);

        int solvedCount = completedQuestionIds.size();
        int completedResourcesCount = completedResourceIds.size();

        double overallPercentage = 0.0;
        long totalItems = totalQuestions + totalResources;
        if (totalItems > 0) {
            overallPercentage = ((double) (solvedCount + completedResourcesCount) / totalItems) * 100.0;
            // Round to 1 decimal place
            overallPercentage = Math.round(overallPercentage * 10.0) / 10.0;
        }

        List<Topic> rootTopics = topicRepository.findByParentTopicIsNull();
        List<ProgressDto.TopicProgressDetail> topicProgressDetails = new ArrayList<>();

        for (Topic rootTopic : rootTopics) {
            List<Long> topicIds = new ArrayList<>();
            collectTopicIds(rootTopic, topicIds);

            // Fetch questions and resources matching these topic IDs
            List<PracticeQuestion> topicQuestions = questionRepository.findAll().stream()
                    .filter(q -> topicIds.contains(q.getTopic().getId()))
                    .toList();

            List<Resource> topicResources = resourceRepository.findAll().stream()
                    .filter(r -> topicIds.contains(r.getTopic().getId()))
                    .toList();

            int topicTotalQuestions = topicQuestions.size();
            int topicTotalResources = topicResources.size();

            int topicSolvedQuestions = (int) topicQuestions.stream()
                    .filter(q -> completedQuestionIds.contains(q.getId()))
                    .count();

            int topicCompletedResources = (int) topicResources.stream()
                    .filter(r -> completedResourceIds.contains(r.getId()))
                    .count();

            double topicPercentage = 0.0;
            int topicTotalItems = topicTotalQuestions + topicTotalResources;
            if (topicTotalItems > 0) {
                topicPercentage = ((double) (topicSolvedQuestions + topicCompletedResources) / topicTotalItems) * 100.0;
                topicPercentage = Math.round(topicPercentage * 10.0) / 10.0;
            }

            topicProgressDetails.add(ProgressDto.TopicProgressDetail.builder()
                    .topicId(rootTopic.getId())
                    .topicName(rootTopic.getName())
                    .solvedQuestions(topicSolvedQuestions)
                    .totalQuestions(topicTotalQuestions)
                    .completedResources(topicCompletedResources)
                    .totalResources(topicTotalResources)
                    .percentage(topicPercentage)
                    .build());
        }

        return ProgressDto.builder()
                .totalQuestions((int) totalQuestions)
                .solvedQuestions(solvedCount)
                .totalResources((int) totalResources)
                .completedResources(completedResourcesCount)
                .overallPercentage(overallPercentage)
                .topicProgress(topicProgressDetails)
                .build();
    }

    private void collectTopicIds(Topic topic, List<Long> ids) {
        ids.add(topic.getId());
        for (Topic sub : topic.getSubtopics()) {
            collectTopicIds(sub, ids);
        }
    }

    private UserLearningProgress getOrCreateProgress(String email) {
        return progressRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
                    UserLearningProgress newProgress = UserLearningProgress.builder()
                            .user(user)
                            .completedQuestions(new HashSet<>())
                            .completedResources(new HashSet<>())
                            .build();
                    return progressRepository.save(newProgress);
                });
    }

    private Set<Long> getCompletedQuestionIds(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Collections.emptySet();
        }
        return progressRepository.findByUserEmail(email)
                .map(p -> p.getCompletedQuestions().stream()
                        .map(PracticeQuestion::getId)
                        .collect(Collectors.toSet()))
                .orElse(Collections.emptySet());
    }

    private Set<Long> getCompletedResourceIds(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Collections.emptySet();
        }
        return progressRepository.findByUserEmail(email)
                .map(p -> p.getCompletedResources().stream()
                        .map(Resource::getId)
                        .collect(Collectors.toSet()))
                .orElse(Collections.emptySet());
    }

    @Override
    public List<RoadmapResponseDto> getAllRoadmaps(String userEmail) {
        List<Roadmap> roadmaps = roadmapRepository.findAll();
        Set<Long> completedQuestionIds = getCompletedQuestionIds(userEmail);
        Set<Long> completedResourceIds = getCompletedResourceIds(userEmail);

        return roadmaps.stream()
                .map(rm -> {
                    double progress = calculateRoadmapProgress(rm, completedQuestionIds, completedResourceIds);
                    List<RoadmapStepDto> steps = rm.getSteps().stream()
                            .map(step -> mapToStepDto(step, completedQuestionIds, completedResourceIds))
                            .collect(Collectors.toList());

                    return RoadmapResponseDto.builder()
                            .id(rm.getId())
                            .title(rm.getTitle())
                            .description(rm.getDescription())
                            .icon(rm.getIcon())
                            .progressPercentage(progress)
                            .steps(steps)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public RoadmapResponseDto getRoadmapById(Long roadmapId, String userEmail) {
        Roadmap rm = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new IllegalArgumentException("Roadmap not found with ID: " + roadmapId));
        Set<Long> completedQuestionIds = getCompletedQuestionIds(userEmail);
        Set<Long> completedResourceIds = getCompletedResourceIds(userEmail);

        double progress = calculateRoadmapProgress(rm, completedQuestionIds, completedResourceIds);
        List<RoadmapStepDto> steps = rm.getSteps().stream()
                .map(step -> mapToStepDto(step, completedQuestionIds, completedResourceIds))
                .collect(Collectors.toList());

        return RoadmapResponseDto.builder()
                .id(rm.getId())
                .title(rm.getTitle())
                .description(rm.getDescription())
                .icon(rm.getIcon())
                .progressPercentage(progress)
                .steps(steps)
                .build();
    }

    private RoadmapStepDto mapToStepDto(RoadmapStep step, Set<Long> completedQuestionIds, Set<Long> completedResourceIds) {
        double progress = calculateTopicsProgress(step.getTopics(), completedQuestionIds, completedResourceIds);
        List<TopicResponseDto> topics = step.getTopics().stream()
                .map(this::mapToTopicResponseDto)
                .collect(Collectors.toList());

        return RoadmapStepDto.builder()
                .id(step.getId())
                .stepOrder(step.getStepOrder())
                .title(step.getTitle())
                .description(step.getDescription())
                .progressPercentage(progress)
                .topics(topics)
                .build();
    }

    private double calculateRoadmapProgress(Roadmap rm, Set<Long> completedQuestionIds, Set<Long> completedResourceIds) {
        List<Topic> allTopics = new ArrayList<>();
        for (RoadmapStep step : rm.getSteps()) {
            allTopics.addAll(step.getTopics());
        }
        return calculateTopicsProgress(allTopics, completedQuestionIds, completedResourceIds);
    }

    private double calculateTopicsProgress(List<Topic> topics, Set<Long> completedQuestionIds, Set<Long> completedResourceIds) {
        List<Long> allTopicIds = new ArrayList<>();
        for (Topic topic : topics) {
            collectTopicIds(topic, allTopicIds);
        }

        if (allTopicIds.isEmpty()) {
            return 0.0;
        }

        List<PracticeQuestion> questions = questionRepository.findAll().stream()
                .filter(q -> q.getTopic() != null && allTopicIds.contains(q.getTopic().getId()))
                .toList();

        List<Resource> resources = resourceRepository.findAll().stream()
                .filter(r -> r.getTopic() != null && allTopicIds.contains(r.getTopic().getId()))
                .toList();

        int totalCount = questions.size() + resources.size();
        if (totalCount == 0) {
            return 0.0;
        }

        long completedCount = questions.stream().filter(q -> completedQuestionIds.contains(q.getId())).count() +
                resources.stream().filter(r -> completedResourceIds.contains(r.getId())).count();

        double percentage = ((double) completedCount / totalCount) * 100.0;
        return Math.round(percentage * 10.0) / 10.0;
    }

}
