package com.backend.autoapplypro.modules.learning.repository;

import com.backend.autoapplypro.modules.learning.model.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    Optional<Roadmap> findByTitleIgnoreCase(String title);
}
