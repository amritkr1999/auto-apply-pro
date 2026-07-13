package com.backend.autoapplypro.modules.outreach.repository;

import com.backend.autoapplypro.modules.outreach.model.TemplateFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateFavoriteRepository extends JpaRepository<TemplateFavorite, Long> {
    Optional<TemplateFavorite> findByTemplateIdAndUserId(String templateId, Long userId);
    List<TemplateFavorite> findByUserId(Long userId);
}
