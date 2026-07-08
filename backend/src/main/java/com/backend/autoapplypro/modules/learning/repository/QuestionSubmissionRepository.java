package com.backend.autoapplypro.modules.learning.repository;

import com.backend.autoapplypro.modules.learning.model.QuestionSubmission;
import com.backend.autoapplypro.modules.learning.model.QuestionSubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionSubmissionRepository extends JpaRepository<QuestionSubmission, Long> {
    List<QuestionSubmission> findByStatus(QuestionSubmissionStatus status);
    List<QuestionSubmission> findBySubmittedByIdOrderByCreatedAtDesc(Long userId);
    List<QuestionSubmission> findAllByOrderByCreatedAtDesc();
}
