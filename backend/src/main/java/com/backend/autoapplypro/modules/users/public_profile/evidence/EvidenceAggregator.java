package com.backend.autoapplypro.modules.users.public_profile.evidence;

import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.public_profile.dto.AchievementCard;
import java.util.List;
import java.util.Map;

/**
 * Pluggable contract for the Universal Career Engine.
 * Each professional vertical implements this to aggregate external metrics,
 * generate profile highlights, and calculate user trust scores.
 */
public interface EvidenceAggregator {
    /**
     * Unique identifier for the professional vertical (e.g. "DEVELOPER", "LEGAL", "EXECUTIVE").
     */
    String getVerticalId();

    /**
     * Aggregate verified third-party stats or profile metadata.
     */
    Map<String, Object> aggregateMetrics(User user);

    /**
     * Generate visual achievement/credential highlights.
     */
    List<AchievementCard> generateHighlights(User user);

    /**
     * Calculate and return a verified trust score from 0 to 100.
     */
    int calculateTrustScore(User user);
}
