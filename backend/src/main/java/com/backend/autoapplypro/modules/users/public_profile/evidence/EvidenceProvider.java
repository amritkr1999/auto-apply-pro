package com.backend.autoapplypro.modules.users.public_profile.evidence;

import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.ProfessionalVertical;
import com.backend.autoapplypro.modules.users.public_profile.dto.AchievementCard;
import java.util.List;
import java.util.Map;

/**
 * Standard contract for fetching or parsing career data based on professional vertical.
 */
public interface EvidenceProvider extends EvidenceAggregator {
    /**
     * Fetch structured metrics for the public profile.
     */
    Map<String, Object> getEvidenceMetrics(User user);

    /**
     * Generate list of achievement cards.
     */
    List<AchievementCard> getHighlights(User user);

    /**
     * Checks if this provider supports the given vertical.
     */
    boolean supports(ProfessionalVertical vertical);

    /**
     * Return the verification method description.
     */
    String getVerificationMethod();

    /**
     * Calculate and return the trust score for the user.
     */
    int calculateTrustScore(User user);

    @Override
    default String getVerticalId() {
        if (supports(ProfessionalVertical.DEVELOPER)) return "DEVELOPER";
        if (supports(ProfessionalVertical.KNOWLEDGE_WORKER)) return "KNOWLEDGE_WORKER";
        return "DOCUMENT_VERIFICATION";
    }

    @Override
    default Map<String, Object> aggregateMetrics(User user) {
        return getEvidenceMetrics(user);
    }

    @Override
    default List<AchievementCard> generateHighlights(User user) {
        return getHighlights(user);
    }
}
