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
 * DeveloperEvidenceProvider fetches LeetCode, GitHub, and LinkedIn stats from candidate profiles
 * and builds achievement cards highlighting coding and open-source contributions.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class TechnicalEvidenceProvider implements EvidenceProvider {

    private final EvidenceVerifier evidenceVerifier;

    @Override
    public Map<String, Object> getEvidenceMetrics(User user) {
        log.info("Compiling developer evidence metrics for User ID: {}", user.getId());
        Map<String, Object> metrics = new HashMap<>();
        ProfessionalProfile candidate = user.getProfessionalProfile();
        if (candidate != null) {
            if (candidate.getGithubUsername() != null) {
                metrics.put("github", Map.of(
                        "username", candidate.getGithubUsername(),
                        "profileUrl", candidate.getGithubProfileUrl() != null ? candidate.getGithubProfileUrl() : "",
                        "publicRepos", getNestedInt(candidate.getGithubStats(), "publicRepos"),
                        "stars", getNestedInt(candidate.getGithubStats(), "stars"),
                        "contributions", getNestedInt(candidate.getGithubStats(), "contributions"),
                        "followers", getNestedInt(candidate.getGithubStats(), "followers")
                ));
            }
            if (candidate.getLeetcodeUsername() != null) {
                metrics.put("leetcode", Map.of(
                        "username", candidate.getLeetcodeUsername(),
                        "totalSolved", getNestedInt(candidate.getLeetcodeStats(), "totalSolved"),
                        "easySolved", getNestedInt(candidate.getLeetcodeStats(), "easySolved"),
                        "mediumSolved", getNestedInt(candidate.getLeetcodeStats(), "mediumSolved"),
                        "hardSolved", getNestedInt(candidate.getLeetcodeStats(), "hardSolved"),
                        "ranking", getNestedInt(candidate.getLeetcodeStats(), "ranking")
                ));
            }
            if (candidate.getLinkedinName() != null) {
                metrics.put("linkedin", Map.of(
                        "name", candidate.getLinkedinName(),
                        "profileUrl", candidate.getLinkedinProfileUrl() != null ? candidate.getLinkedinProfileUrl() : ""
                ));
            }
        }
        return metrics;
    }

    @Override
    public List<AchievementCard> getHighlights(User user) {
        List<AchievementCard> cards = new ArrayList<>();
        ProfessionalProfile candidate = user.getProfessionalProfile();
        if (candidate != null) {
            Map<String, Object> github = candidate.getGithubStats();
            Map<String, Object> leetcode = candidate.getLeetcodeStats();

            int repos = getNestedInt(github, "publicRepos");
            int stars = getNestedInt(github, "stars");
            int solved = getNestedInt(leetcode, "totalSolved");

            int trustScore = calculateTrustScore(user);
            boolean isVerified = trustScore > 70;

            if (stars > 0) {
                cards.add(AchievementCard.builder()
                        .title("Open Source Contributor")
                        .description("Earned " + stars + " stars across public repositories.")
                        .category("GitHub")
                        .badgeUrl("⭐")
                        .trustScore(trustScore)
                        .isVerified(isVerified)
                        .build());
            } else if (repos > 0) {
                cards.add(AchievementCard.builder()
                        .title("Active Codebase Architect")
                        .description("Built and shipped " + repos + " open-source projects.")
                        .category("GitHub")
                        .badgeUrl("📁")
                        .trustScore(trustScore)
                        .isVerified(isVerified)
                        .build());
            }

            if (solved > 0) {
                cards.add(AchievementCard.builder()
                        .title("Verified Problem Solver")
                        .description("Solved " + solved + " algorithms and data structure challenges on LeetCode.")
                        .category("LeetCode")
                        .badgeUrl("👑")
                        .trustScore(trustScore)
                        .isVerified(isVerified)
                        .build());
            }

            if (Boolean.TRUE.equals(candidate.getIsVerified())) {
                cards.add(AchievementCard.builder()
                        .title("Verified Identity")
                        .description("Linked and authenticated via official OAuth channels.")
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
        return vertical == ProfessionalVertical.DEVELOPER;
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
        boolean hasOauth = candidate.getGithubUsername() != null || candidate.getLinkedinName() != null;
        boolean hasDoc = false;
        boolean hasRef = Boolean.TRUE.equals(candidate.getIsReferenceCheckConfirmed());
        return evidenceVerifier.calculateTrustScore(hasOauth, hasDoc, hasRef);
    }

    private int getNestedInt(Map<String, Object> map, String key) {
        if (map == null || !map.containsKey(key) || map.get(key) == null) {
            return 0;
        }
        try {
            return ((Number) map.get(key)).intValue();
        } catch (Exception e) {
            return 0;
        }
    }
}
