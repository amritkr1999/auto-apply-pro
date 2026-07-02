package com.backend.autoapplypro.modules.feedback.service;

import com.backend.autoapplypro.modules.feedback.dto.FeedbackRequestDto;
import com.backend.autoapplypro.modules.feedback.dto.FeedbackResponseDto;
import com.backend.autoapplypro.modules.feedback.dto.FeedbackStatusResponse;
import com.backend.autoapplypro.modules.feedback.model.Feedback;
import com.backend.autoapplypro.modules.feedback.repository.FeedbackRepository;
import com.backend.autoapplypro.modules.jobs.repository.JobApplicationRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;

    @Override
    @Transactional
    public FeedbackResponseDto submitFeedback(Long userId, FeedbackRequestDto requestDto) {
        if (requestDto.getRating() == null || requestDto.getRating() < 1 || requestDto.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        if (requestDto.getComment() == null || requestDto.getComment().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment cannot be empty");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // If the user already submitted feedback, let's update it or save another?
        // Updating or creating a new one is fine, let's just save it. 
        // To prevent duplicate feedbacks spamming, let's check if user already has one.
        // If they do, we can update it, otherwise create a new one. That's cleaner!
        Feedback feedback = feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(f -> f.getUser().getId().equals(userId))
                .findFirst()
                .orElse(null);

        if (feedback != null) {
            feedback.setRating(requestDto.getRating());
            feedback.setComment(requestDto.getComment().trim());
        } else {
            feedback = Feedback.builder()
                    .user(user)
                    .rating(requestDto.getRating())
                    .comment(requestDto.getComment().trim())
                    .build();
        }

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return mapToResponseDto(savedFeedback);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponseDto> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackStatusResponse getFeedbackStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 1. If user has already submitted feedback, don't show popup
        boolean hasSubmitted = feedbackRepository.existsByUser(user);
        if (hasSubmitted) {
            return FeedbackStatusResponse.builder().showPopup(false).build();
        }

        // 2. Check if account is at least 7 days old
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        boolean isOldAccount = user.getCreatedAt() != null && user.getCreatedAt().isBefore(oneWeekAgo);

        // 3. Check if user has submitted at least 5 job applications
        long applicationCount = jobApplicationRepository.countByUserId(userId);

        boolean eligible = isOldAccount || applicationCount >= 5;

        return FeedbackStatusResponse.builder()
                .showPopup(eligible)
                .build();
    }

    private FeedbackResponseDto mapToResponseDto(Feedback feedback) {
        String roleStr = feedback.getUser().getRole() != null ? feedback.getUser().getRole().name() : "USER";
        String formattedRole = roleStr.substring(0, 1).toUpperCase() + roleStr.substring(1).toLowerCase();

        return FeedbackResponseDto.builder()
                .id(feedback.getId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .userName(feedback.getUser().getName())
                .userRole(formattedRole)
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
