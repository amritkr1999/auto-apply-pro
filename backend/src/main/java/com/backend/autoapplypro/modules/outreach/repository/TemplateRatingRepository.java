package com.backend.autoapplypro.modules.outreach.repository;

import com.backend.autoapplypro.modules.outreach.model.TemplateRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import java.util.List;

@Repository
public interface TemplateRatingRepository extends JpaRepository<TemplateRating, Long> {
    Optional<TemplateRating> findByTemplateIdAndUserId(String templateId, Long userId);
    List<TemplateRating> findByUserId(Long userId);
}
