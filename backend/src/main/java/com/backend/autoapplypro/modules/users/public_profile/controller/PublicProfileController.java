package com.backend.autoapplypro.modules.users.public_profile.controller;

import com.backend.autoapplypro.modules.users.public_profile.dto.PublicProfileDTO;
import com.backend.autoapplypro.modules.users.public_profile.dto.PublicProfileProjection;
import com.backend.autoapplypro.modules.users.public_profile.dto.AchievementCard;
import com.backend.autoapplypro.modules.users.public_profile.evidence.EvidenceEngine;
import com.backend.autoapplypro.modules.users.public_profile.evidence.EvidenceProvider;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/profile")
@RequiredArgsConstructor
@Slf4j
public class PublicProfileController {

    private final UserRepository userRepository;
    private final EvidenceEngine evidenceEngine;

    @GetMapping("/{username}")
    public ResponseEntity<PublicProfileDTO> getPublicProfile(@PathVariable String username) {
        log.info("Fetching public profile for username: {}", username);
        
        String cleanUsername = username.trim().toLowerCase();
        
        // 1. Check if user exists and check isProfilePublic flag
        Boolean isPublic = userRepository.findIsProfilePublicByUsername(cleanUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found or private"));
                
        if (!isPublic) {
            log.warn("Profile for username {} is private", cleanUsername);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Profile not found or private");
        }
        
        // 2. Fetch the user to determine their vertical
        User user = userRepository.findByUsername(cleanUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found or private"));
                
        // 3. Fetch skills separately
        List<String> skills = userRepository.findSkillsByUsername(cleanUsername);
        
        // 4. Resolve the polymorphic strategy provider for their vertical
        EvidenceProvider provider = evidenceEngine.getProvider(user.getProfessionalVertical());
        Map<String, Object> evidenceMetrics = provider.getEvidenceMetrics(user);
        List<AchievementCard> highlights = new java.util.ArrayList<>(provider.getHighlights(user));
        if (user.getProfessionalProfile() != null && user.getProfessionalProfile().getAchievements() != null) {
            for (com.backend.autoapplypro.modules.users.model.Achievement ach : user.getProfessionalProfile().getAchievements()) {
                highlights.add(AchievementCard.builder()
                        .title(ach.getTitle())
                        .description(ach.getDescription())
                        .category(ach.getCategory())
                        .badgeUrl(ach.getBadgeUrl())
                        .trustScore(ach.getTrustScore())
                        .isVerified(ach.getTrustScore() != null && ach.getTrustScore() > 70)
                        .build());
            }
        }
        
        // 5. Map to DTO
        PublicProfileDTO dto = PublicProfileDTO.builder()
                .username(user.getUsername())
                .name(user.getName())
                .summary(user.getProfessionalProfile() != null ? user.getProfessionalProfile().getSummary() : null)
                .avatar(user.getAvatar())
                .isVerified(user.getProfessionalProfile() != null && Boolean.TRUE.equals(user.getProfessionalProfile().getIsVerified()))
                .skills(skills)
                .professionalVertical(user.getProfessionalVertical() != null ? user.getProfessionalVertical().name() : "DEVELOPER")
                .evidenceMetrics(evidenceMetrics)
                .highlights(highlights)
                .build();
                
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsernameAvailability(@RequestParam String username) {
        String clean = username.trim().toLowerCase().replaceAll("[^a-z0-9_]", "");
        if (clean.isEmpty()) {
            return ResponseEntity.ok(Map.of("available", false));
        }
        boolean exists = userRepository.existsByUsername(clean);
        return ResponseEntity.ok(Map.of("available", !exists));
    }
}
