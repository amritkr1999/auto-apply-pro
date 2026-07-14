package com.backend.autoapplypro.modules.users.repository;

import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProfessionalProfileRepository extends JpaRepository<ProfessionalProfile, Long> {
    
    List<ProfessionalProfile> findAllByUserId(Long userId);
    
    Optional<ProfessionalProfile> findByUserIdAndIsDefaultTrue(Long userId);

    @Query("SELECT p FROM ProfessionalProfile p WHERE p.user.id = :userId ORDER BY p.isDefault DESC, p.id ASC")
    List<ProfessionalProfile> findProfilesByUserIdOrdered(@Param("userId") Long userId);

    default Optional<ProfessionalProfile> findByUserId(Long userId) {
        List<ProfessionalProfile> profiles = findProfilesByUserIdOrdered(userId);
        return profiles.isEmpty() ? Optional.empty() : Optional.of(profiles.get(0));
    }
}
