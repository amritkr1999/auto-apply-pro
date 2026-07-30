package com.backend.autoapplypro.modules.users.public_profile.evidence;

import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.model.ProfessionalVertical;
import com.backend.autoapplypro.modules.users.public_profile.dto.AchievementCard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * KnowledgeWorkerEvidenceProvider fetches LinkedIn information and project experience
 * metrics for managers, consultants, and non-technical business leaders.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class KnowledgeWorkerEvidenceProvider implements EvidenceProvider {

    private final EvidenceVerifier evidenceVerifier;

    @Override
    public Map<String, Object> getEvidenceMetrics(User user) {
        log.info("Compiling knowledge worker evidence metrics for User ID: {}", user.getId());
        Map<String, Object> metrics = new HashMap<>();
        ProfessionalProfile candidate = user.getProfessionalProfile();
        if (candidate != null) {
            if (candidate.getLinkedinName() != null) {
                metrics.put("linkedin", Map.of(
                        "name", candidate.getLinkedinName(),
                        "profileUrl", candidate.getLinkedinProfileUrl() != null ? candidate.getLinkedinProfileUrl() : ""
                ));
            }
            // Dynamic Project summary from candidate experience list
            List<Map<String, Object>> exp = candidate.getExperience();
            int totalProjects = 0;
            if (exp != null) {
                totalProjects = exp.size();
            }
            metrics.put("projects", Map.of(
                    "totalProjects", totalProjects,
                    "focusArea", "Strategic Leadership & Operations"
            ));
        }
        return metrics;
    }

    @Override
    public List<AchievementCard> getHighlights(User user) {
        List<AchievementCard> cards = new ArrayList<>();
        ProfessionalProfile candidate = user.getProfessionalProfile();
        if (candidate != null) {
            int trustScore = calculateTrustScore(user);
            boolean isVerified = trustScore > 70;

            List<Map<String, Object>> expList = candidate.getExperience();
            if (expList != null && !expList.isEmpty()) {
                cards.add(AchievementCard.builder()
                        .title("Operational Impact")
                        .description("Successfully directed operations across " + expList.size() + " strategic milestones.")
                        .category("Projects")
                        .badgeUrl("📈")
                        .trustScore(trustScore)
                        .isVerified(isVerified)
                        .build());
            }

            if (candidate.getLinkedinName() != null) {
                cards.add(AchievementCard.builder()
                        .title("Connected Leader")
                        .description("Active profile established on professional LinkedIn network.")
                        .category("LinkedIn")
                        .badgeUrl("💼")
                        .trustScore(trustScore)
                        .isVerified(isVerified)
                        .build());
            }

            if (Boolean.TRUE.equals(candidate.getIsVerified())) {
                cards.add(AchievementCard.builder()
                        .title("Identity Verified")
                        .description("Secure verification completed via account credentials.")
                        .category("Verification")
                        .badgeUrl("✔")
                        .trustScore(trustScore)
                        .isVerified(isVerified)
                        .build());
            }
        }
        return cards;
    }

    @Override
    public boolean supports(ProfessionalVertical vertical) {
        return vertical == ProfessionalVertical.KNOWLEDGE_WORKER;
    }

    @Override
    public String getVerificationMethod() {
        return "OAuth Source";
    }

    @Override
    public int calculateTrustScore(User user) {
        ProfessionalProfile candidate = user.getProfessionalProfile();
        if (candidate == null) {
            return 10;
        }
        boolean hasOauth = candidate.getLinkedinName() != null;
        boolean hasDoc = candidate.getResumeFilename() != null && !candidate.getResumeFilename().trim().isEmpty();
        boolean hasRef = Boolean.TRUE.equals(candidate.getIsReferenceCheckConfirmed());
        return evidenceVerifier.calculateTrustScore(hasOauth, hasDoc, hasRef);
    }
}
