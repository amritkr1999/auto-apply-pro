package com.backend.autoapplypro.modules.learning.service;

import com.backend.autoapplypro.modules.learning.dto.AdminReviewRequestDto;
import com.backend.autoapplypro.modules.learning.dto.QuestionSubmissionRequestDto;
import com.backend.autoapplypro.modules.learning.dto.QuestionSubmissionResponseDto;
import com.backend.autoapplypro.modules.learning.model.*;
import com.backend.autoapplypro.modules.learning.repository.PracticeQuestionRepository;
import com.backend.autoapplypro.modules.learning.repository.QuestionSubmissionRepository;
import com.backend.autoapplypro.modules.learning.repository.TopicRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class QuestionSubmissionServiceImpl implements QuestionSubmissionService {

    private final QuestionSubmissionRepository submissionRepository;
    private final PracticeQuestionRepository questionRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public QuestionSubmissionResponseDto submitQuestion(QuestionSubmissionRequestDto dto, String userEmail) {
        log.info("User {} submitting new practice question titled '{}'", userEmail, dto.getTitle());

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        Topic subject = topicRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject topic not found with ID: " + dto.getSubjectId()));

        Topic topic = topicRepository.findById(dto.getTopicId())
                .orElseThrow(() -> new IllegalArgumentException("Subtopic topic not found with ID: " + dto.getTopicId()));

        if (dto.getChoices() == null || dto.getChoices().size() < 2) {
            throw new IllegalArgumentException("A question must have at least 2 choices.");
        }

        if (dto.getCorrectAnswer() == null || dto.getCorrectAnswer().trim().isEmpty()) {
            throw new IllegalArgumentException("Correct answer must be specified.");
        }

        QuestionSubmission submission = QuestionSubmission.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .difficulty(dto.getDifficulty())
                .subjectTopic(subject)
                .topic(topic)
                .submittedBy(user)
                .choices(new ArrayList<>(dto.getChoices()))
                .correctAnswer(dto.getCorrectAnswer())
                .explanation(dto.getExplanation())
                .status(QuestionSubmissionStatus.PENDING)
                .build();

        QuestionSubmission saved = submissionRepository.save(submission);
        return mapToResponseDto(saved);
    }

    @Override
    public List<QuestionSubmissionResponseDto> getPendingSubmissions() {
        return submissionRepository.findByStatus(QuestionSubmissionStatus.PENDING).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionSubmissionResponseDto> getUserSubmissions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        return submissionRepository.findBySubmittedByIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuestionSubmissionResponseDto reviewSubmission(Long submissionId, AdminReviewRequestDto dto, String adminEmail) {
        log.info("Admin {} reviewing submission {} with status {}", adminEmail, submissionId, dto.getStatus());

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found with email: " + adminEmail));

        QuestionSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Question submission not found with ID: " + submissionId));

        if (submission.getStatus() != QuestionSubmissionStatus.PENDING) {
            throw new IllegalArgumentException("This submission has already been reviewed.");
        }

        submission.setStatus(dto.getStatus());
        submission.setAdminFeedback(dto.getFeedback());
        submission.setReviewedBy(admin);

        if (dto.getStatus() == QuestionSubmissionStatus.APPROVED) {
            PracticeQuestion practiceQuestion = PracticeQuestion.builder()
                    .title(submission.getTitle())
                    .content(submission.getContent())
                    .difficulty(submission.getDifficulty())
                    .topic(submission.getTopic())
                    .choices(new ArrayList<>(submission.getChoices()))
                    .correctAnswer(submission.getCorrectAnswer())
                    .explanation(submission.getExplanation())
                    .averageRating(0.0)
                    .totalRatings(0)
                    .build();

            questionRepository.save(practiceQuestion);
            log.info("Created and published practice question from submission {}", submissionId);
        }

        QuestionSubmission saved = submissionRepository.save(submission);
        return mapToResponseDto(saved);
    }

    private QuestionSubmissionResponseDto mapToResponseDto(QuestionSubmission s) {
        return QuestionSubmissionResponseDto.builder()
                .id(s.getId())
                .title(s.getTitle())
                .content(s.getContent())
                .difficulty(s.getDifficulty())
                .choices(s.getChoices())
                .correctAnswer(s.getCorrectAnswer())
                .explanation(s.getExplanation())
                .subjectId(s.getSubjectTopic() != null ? s.getSubjectTopic().getId() : null)
                .subjectName(s.getSubjectTopic() != null ? s.getSubjectTopic().getName() : null)
                .topicId(s.getTopic() != null ? s.getTopic().getId() : null)
                .topicName(s.getTopic() != null ? s.getTopic().getName() : null)
                .submittedByEmail(s.getSubmittedBy() != null ? s.getSubmittedBy().getEmail() : null)
                .submittedByName(s.getSubmittedBy() != null ? s.getSubmittedBy().getName() : null)
                .status(s.getStatus())
                .adminFeedback(s.getAdminFeedback())
                .reviewedByEmail(s.getReviewedBy() != null ? s.getReviewedBy().getEmail() : null)
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
