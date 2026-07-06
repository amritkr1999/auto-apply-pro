package com.backend.autoapplypro.modules.users.public_profile.controller;

import com.backend.autoapplypro.modules.users.public_profile.dto.PublicProfileDTO;
import com.backend.autoapplypro.modules.users.public_profile.dto.PublicProfileProjection;
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
        
        // 2. Fetch the projection (ensures database query explicitly excludes sensitive fields)
        PublicProfileProjection projection = userRepository.findPublicProfileByUsername(cleanUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found or private"));
                
        // 3. Fetch skills separately
        List<String> skills = userRepository.findSkillsByUsername(cleanUsername);
        
        // 4. Map to DTO
        PublicProfileDTO dto = PublicProfileDTO.builder()
                .username(projection.getUsername())
                .name(projection.getName())
                .summary(projection.getSummary())
                .avatar(projection.getAvatar())
                .githubUsername(projection.getGithubUsername())
                .githubProfileUrl(projection.getGithubProfileUrl())
                .linkedinProfileUrl(projection.getLinkedinProfileUrl())
                .linkedinName(projection.getLinkedinName())
                .githubStats(projection.getGithubStats())
                .leetcodeStats(projection.getLeetcodeStats())
                .leetcodeUsername(projection.getLeetcodeUsername())
                .isVerified(projection.getIsVerified() != null ? projection.getIsVerified() : false)
                .skills(skills)
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
