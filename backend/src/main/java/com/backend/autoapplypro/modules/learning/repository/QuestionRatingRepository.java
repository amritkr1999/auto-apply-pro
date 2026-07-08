package com.backend.autoapplypro.modules.learning.repository;

import com.backend.autoapplypro.modules.learning.model.QuestionRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRatingRepository extends JpaRepository<QuestionRating, Long> {
    Optional<QuestionRating> findByQuestionIdAndUserId(Long questionId, Long userId);
    List<QuestionRating> findByQuestionId(Long questionId);

    @Query("SELECT COALESCE(AVG(qr.rating), 0.0) FROM QuestionRating qr WHERE qr.question.id = :questionId")
    Double getAverageRatingForQuestion(@Param("questionId") Long questionId);

    @Query("SELECT COUNT(qr) FROM QuestionRating qr WHERE qr.question.id = :questionId")
    Integer getRatingsCountForQuestion(@Param("questionId") Long questionId);
}
