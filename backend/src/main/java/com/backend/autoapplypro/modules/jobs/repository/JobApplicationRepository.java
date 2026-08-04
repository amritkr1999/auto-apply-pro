package com.backend.autoapplypro.modules.jobs.repository;

import com.backend.autoapplypro.modules.jobs.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<JobApplication> findByUserId(Long userId);
    long countByUserId(Long userId);
    List<JobApplication> findByUserIdAndCreatedAtBetween(Long userId, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
