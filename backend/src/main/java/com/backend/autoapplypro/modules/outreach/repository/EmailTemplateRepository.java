package com.backend.autoapplypro.modules.outreach.repository;

import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, String> {
}
