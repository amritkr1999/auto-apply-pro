package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.outreach.exception.TemplateLimitExceededException;
import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import com.backend.autoapplypro.modules.billing.repository.SubscriptionRepository;
import com.backend.autoapplypro.modules.users.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateLimitValidator {

    private final EmailTemplateRepository templateRepository;
    private final SubscriptionRepository subscriptionRepository;

    public void validateTemplateSave(User user, EmailTemplate template) {
        boolean isPremium = subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                user.getId(), List.of("active", "authenticated", "pending")
        ).isPresent();

        // 1. Privacy validation: only premium users can set isPublic = false
        if (Boolean.FALSE.equals(template.getIsPublic()) && !isPremium) {
            throw new IllegalArgumentException("Only premium users have the option to keep their personal created templates private.");
        }

        // 2. Limit validation: free users have a limit of 3 custom templates (only for new templates)
        if (!isPremium) {
            boolean isNew = template.getId() == null || !templateRepository.existsById(template.getId());
            if (isNew) {
                long count = templateRepository.countByCreatorId(user.getId());
                if (count >= 3) {
                    throw new TemplateLimitExceededException("Template limit reached. Free users can create a maximum of 3 custom templates.");
                }
            }
        }
    }
}
