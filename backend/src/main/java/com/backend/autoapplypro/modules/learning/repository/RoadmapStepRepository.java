package com.backend.autoapplypro.modules.learning.repository;

import com.backend.autoapplypro.modules.learning.model.RoadmapStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadmapStepRepository extends JpaRepository<RoadmapStep, Long> {
    List<RoadmapStep> findByRoadmapIdOrderByStepOrderAsc(Long roadmapId);
}
