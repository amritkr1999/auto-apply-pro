package com.backend.autoapplypro.modules.jobs.repository;

import com.backend.autoapplypro.modules.jobs.model.RawHarvestedJob;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RawHarvestedJobRepository extends JpaRepository<RawHarvestedJob, Long> {
    List<RawHarvestedJob> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
