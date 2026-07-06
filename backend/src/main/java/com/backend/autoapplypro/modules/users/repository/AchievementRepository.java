package com.backend.autoapplypro.modules.users.repository;

import com.backend.autoapplypro.modules.users.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByCandidateId(Long candidateId);
}
