package com.backend.autoapplypro.modules.users.repository;

import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProfessionalProfileRepository extends JpaRepository<ProfessionalProfile, Long> {
    Optional<ProfessionalProfile> findByUserId(Long userId);
}
