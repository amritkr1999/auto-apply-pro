package com.backend.autoapplypro.modules.learning.repository;

import com.backend.autoapplypro.modules.learning.model.PracticeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PracticeQuestionRepository extends JpaRepository<PracticeQuestion, Long> {
    List<PracticeQuestion> findByTopicId(Long topicId);
}
