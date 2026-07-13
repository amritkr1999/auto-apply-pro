package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("templateSecurity")
@RequiredArgsConstructor
public class TemplateSecurityService {

    private final EmailTemplateRepository templateRepository;
    private final UserRepository userRepository;

    public boolean canModify(String templateId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Long userId = (Long) authentication.getCredentials();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }

        // Admin can modify any template
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }

        // Fetch template
        Optional<EmailTemplate> templateOpt = templateRepository.findById(templateId);
        if (templateOpt.isEmpty()) {
            return true; // Let the controller handle 404 Not Found
        }

        EmailTemplate template = templateOpt.get();

        // System templates are read-only for standard users
        if (Boolean.TRUE.equals(template.getIsSystemTemplate())) {
            return false;
        }

        // Standard users can only modify templates they created
        return userId.equals(template.getCreatorId());
    }

    public boolean canDelete(String templateId, Authentication authentication) {
        return canModify(templateId, authentication);
    }
}
