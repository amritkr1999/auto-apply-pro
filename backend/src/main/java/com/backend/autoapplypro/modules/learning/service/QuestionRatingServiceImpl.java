package com.backend.autoapplypro.modules.learning.service;

import com.backend.autoapplypro.modules.learning.dto.QuestionRatingRequestDto;
import com.backend.autoapplypro.modules.learning.model.PracticeQuestion;
import com.backend.autoapplypro.modules.learning.model.QuestionRating;
import com.backend.autoapplypro.modules.learning.repository.PracticeQuestionRepository;
import com.backend.autoapplypro.modules.learning.repository.QuestionRatingRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class QuestionRatingServiceImpl implements QuestionRatingService {

    private final QuestionRatingRepository ratingRepository;
    private final PracticeQuestionRepository questionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void rateQuestion(Long questionId, QuestionRatingRequestDto dto, String userEmail) {
        log.info("User {} rating question {} with score {}", userEmail, questionId, dto.getRating());

        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be an integer between 1 and 5.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));

        PracticeQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Practice question not found with ID: " + questionId));

        QuestionRating rating = ratingRepository.findByQuestionIdAndUserId(questionId, user.getId())
                .orElse(null);

        if (rating == null) {
            rating = QuestionRating.builder()
                    .question(question)
                    .user(user)
                    .rating(dto.getRating())
                    .reviewComment(dto.getComment())
                    .build();
        } else {
            rating.setRating(dto.getRating());
            rating.setReviewComment(dto.getComment());
        }

        ratingRepository.save(rating);

        // Recalculate stats and update active question entity
        Double avgRating = ratingRepository.getAverageRatingForQuestion(questionId);
        Integer countRatings = ratingRepository.getRatingsCountForQuestion(questionId);

        question.setAverageRating(avgRating);
        question.setTotalRatings(countRatings);
        questionRepository.save(question);

        log.info("Updated question {} average rating to {} (total ratings: {})", questionId, avgRating, countRatings);
    }
}
