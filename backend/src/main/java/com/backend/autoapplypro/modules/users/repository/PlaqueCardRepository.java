package com.backend.autoapplypro.modules.users.repository;

import com.backend.autoapplypro.modules.users.model.PlaqueCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PlaqueCardRepository extends JpaRepository<PlaqueCard, Long> {
    Optional<PlaqueCard> findByCandidateId(Long candidateId);
    Optional<PlaqueCard> findByCandidateUserId(Long userId);
    Optional<PlaqueCard> findByCandidateUserUsernameIgnoreCase(String username);
}
