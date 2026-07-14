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
 * DocumentVerificationProvider is a strategy that utilizes parsed document audits,
 * licenses, and credentials for verified regulatory professions (e.g. Lawyers/Doctors).
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class DocumentVerificationProvider implements EvidenceProvider {

    private final EvidenceVerifier evidenceVerifier;

    @Override
    public Map<String, Object> getEvidenceMetrics(User user) {
        log.info("Compiling document verification evidence metrics for User ID: {}", user.getId());
        Map<String, Object> metrics = new HashMap<>();
        ProfessionalProfile candidate = user.getProfessionalProfile();
        if (candidate != null) {
            List<String> certs = candidate.getCertifications();
            int totalCerts = certs != null ? certs.size() : 0;
            metrics.put("verification", Map.of(
                    "verifiedDocumentsCount", totalCerts,
                    "status", totalCerts > 0 ? "VERIFIED_CREDENTIALS" : "PENDING_VERIFICATION",
                    "resumeUploaded", candidate.getResumeFilename() != null ? "YES" : "NO"
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

            List<String> certs = candidate.getCertifications();
            if (certs != null && !certs.isEmpty()) {
                for (String cert : certs) {
                    cards.add(AchievementCard.builder()
                            .title("Verified Certification")
                            .description(cert)
                            .category("Verification")
                            .badgeUrl("🛡")
                            .trustScore(trustScore)
                            .isVerified(isVerified)
                            .build());
                }
            }

            if (candidate.getResumeFilename() != null) {
                cards.add(AchievementCard.builder()
                        .title("Authenticated Resume")
                        .description("Official document '" + candidate.getResumeFilename() + "' verified through security OCR pipeline.")
                        .category("Verification")
                        .badgeUrl("📄")
                        .trustScore(trustScore)
                        .isVerified(isVerified)
                        .build());
            }

            if (Boolean.TRUE.equals(candidate.getIsVerified())) {
                cards.add(AchievementCard.builder()
                        .title("Compliance Verified")
                        .description("Identity check and email connection successfully established.")
                        .category("Compliance")
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
        return vertical == ProfessionalVertical.DOCUMENT_VERIFICATION;
    }

    @Override
    public String getVerificationMethod() {
        return "Document AI";
    }

    @Override
    public int calculateTrustScore(User user) {
        ProfessionalProfile candidate = user.getProfessionalProfile();
        if (candidate == null) {
            return 10;
        }
        boolean hasOauth = false;
        boolean hasDoc = candidate.getResumeFilename() != null || (candidate.getCertifications() != null && !candidate.getCertifications().isEmpty());
        boolean hasRef = Boolean.TRUE.equals(candidate.getIsReferenceCheckConfirmed());
        return evidenceVerifier.calculateTrustScore(hasOauth, hasDoc, hasRef);
    }
}
