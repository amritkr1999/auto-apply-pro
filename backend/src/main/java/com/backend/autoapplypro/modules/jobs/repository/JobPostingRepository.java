package com.backend.autoapplypro.modules.jobs.repository;

import com.backend.autoapplypro.modules.jobs.model.JobPosting;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Optional<JobPosting> findByTitleAndCompany(String title, String company);
    
    List<JobPosting> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime cutoff, Pageable pageable);

    @Query("SELECT j FROM JobPosting j WHERE j.createdAt >= :cutoff AND j.hrEmail IS NOT NULL AND TRIM(j.hrEmail) != '' ORDER BY j.createdAt DESC")
    List<JobPosting> findActiveWithHrEmail(LocalDateTime cutoff);

    @Query("SELECT j FROM JobPosting j WHERE j.createdAt >= :cutoff AND j.hrEmail IS NOT NULL AND TRIM(j.hrEmail) != '' AND (LOWER(j.title) LIKE LOWER(CONCAT('%', :roleKeyword, '%')) OR LOWER(j.requirements) LIKE LOWER(CONCAT('%', :roleKeyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :roleKeyword, '%'))) ORDER BY j.createdAt DESC")
    List<JobPosting> findActiveByRoleAndHrEmail(String roleKeyword, LocalDateTime cutoff);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM job_posting_skills WHERE job_posting_id IN (SELECT id FROM job_postings WHERE created_at < :cutoff)", nativeQuery = true)
    int deleteChildSkillsBefore(LocalDateTime cutoff);

    @Transactional
    @Modifying
    @Query("DELETE FROM JobPosting j WHERE j.createdAt < :cutoff")
    int deleteByCreatedAtBefore(LocalDateTime cutoff);
}

