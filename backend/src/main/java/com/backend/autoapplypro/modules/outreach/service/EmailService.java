package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.outreach.dto.EmailGenerationRequestDto;
import com.backend.autoapplypro.modules.outreach.dto.EmailGenerationResponseDto;

public interface EmailService {
    
    /**
     * Orchestrates email generation using a Hybrid Template + Redis Cache approach.
     * Routes models and handles caching/evictions.
     */
    EmailGenerationResponseDto generateEmail(EmailGenerationRequestDto dto, boolean regenerate);

    /**
     * Generates only the opening hook using the AI model (cached).
     */
    String generateHook(Long userId, String companyId, String roleId, String jobDescription, String resumeSnippet, String model);
}
