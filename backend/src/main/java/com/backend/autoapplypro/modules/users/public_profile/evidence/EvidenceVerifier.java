package com.backend.autoapplypro.modules.users.public_profile.evidence;

import org.springframework.stereotype.Service;

@Service
public class EvidenceVerifier {

    private static final int BASELINE = 10;
    private static final int OAUTH_BONUS = 50;
    private static final int DOCUMENT_AI_BONUS = 30;
    private static final int REFERENCE_CHECK_BONUS = 40;
    private static final int VERIFICATION_THRESHOLD = 70;

    /**
     * Calculates the trust score based on confidence-based criteria.
     * This method is thread-safe as it is stateless.
     */
    public int calculateTrustScore(boolean oauthSource, boolean documentAiVerified, boolean referenceCheckConfirmed) {
        int score = BASELINE;
        if (oauthSource) score += OAUTH_BONUS;
        if (documentAiVerified) score += DOCUMENT_AI_BONUS;
        if (referenceCheckConfirmed) score += REFERENCE_CHECK_BONUS;
        return Math.min(100, Math.max(0, score));
    }

    /**
     * Determines verification status based on final trust score.
     */
    public VerificationStatus determineVerificationStatus(int trustScore) {
        return trustScore > VERIFICATION_THRESHOLD ? VerificationStatus.VERIFIED : VerificationStatus.NONE;
    }
}
