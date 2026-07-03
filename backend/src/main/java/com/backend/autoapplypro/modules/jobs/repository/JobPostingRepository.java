package com.backend.autoapplypro.modules.jobs.repository;

import com.backend.autoapplypro.modules.jobs.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    Optional<JobPosting> findByTitleAndCompany(String title, String company);
}
