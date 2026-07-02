package com.backend.autoapplypro.modules.feedback.repository;

import com.backend.autoapplypro.modules.feedback.model.Feedback;
import com.backend.autoapplypro.modules.users.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findAllByOrderByCreatedAtDesc();
    boolean existsByUser(User user);
}
