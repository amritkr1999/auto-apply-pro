package com.backend.autoapplypro.modules.outreach.repository;

import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Sort;
import java.util.List;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, String> {
    long countByCreatorId(Long creatorId);

    @Query("SELECT t FROM EmailTemplate t WHERE t.isSystemTemplate = true OR t.isPublic = true OR t.creatorId = :userId")
    List<EmailTemplate> findAllVisibleTemplates(@Param("userId") Long userId, Sort sort);
}
