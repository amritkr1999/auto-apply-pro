package com.backend.autoapplypro.modules.users.public_profile.evidence;

import com.backend.autoapplypro.modules.users.model.ProfessionalVertical;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Strategy dispatch engine that dynamically selects the correct EvidenceProvider
 * based on the user's professional vertical.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EvidenceEngine {

    private final List<EvidenceProvider> providers;
    private final List<EvidenceAggregator> aggregators;

    /**
     * Resolves the matching EvidenceProvider strategy for a given ProfessionalVertical.
     *
     * @param vertical the target professional vertical
     * @return the matched EvidenceProvider strategy
     * @throws IllegalArgumentException if no provider matches the vertical
     */
    public EvidenceProvider getProvider(ProfessionalVertical vertical) {
        log.debug("Selecting EvidenceProvider strategy for vertical: {}", vertical);
        ProfessionalVertical targetVertical = vertical != null ? vertical : ProfessionalVertical.DEVELOPER;
        return providers.stream()
                .filter(p -> p.supports(targetVertical))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported professional vertical: " + targetVertical));
    }

    /**
     * Dynamically resolves the matching pluggable EvidenceAggregator by vertical ID string.
     *
     * @param verticalId the vertical ID string (e.g., "DEVELOPER", "LEGAL")
     * @return the matched EvidenceAggregator
     */
    public EvidenceAggregator getAggregator(String verticalId) {
        log.debug("Resolving pluggable EvidenceAggregator for vertical ID: {}", verticalId);
        String targetId = verticalId != null ? verticalId.trim().toUpperCase() : "DEVELOPER";
        return aggregators.stream()
                .filter(a -> a.getVerticalId().equalsIgnoreCase(targetId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported professional vertical ID: " + targetId));
    }
}
