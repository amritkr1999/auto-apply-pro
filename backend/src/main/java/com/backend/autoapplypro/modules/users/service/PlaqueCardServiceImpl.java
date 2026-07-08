package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.dto.PlaqueCardContactRequest;
import com.backend.autoapplypro.modules.users.dto.PlaqueCardDto;
import com.backend.autoapplypro.modules.users.model.Candidate;
import com.backend.autoapplypro.modules.users.model.PlaqueCard;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.CandidateRepository;
import com.backend.autoapplypro.modules.users.repository.PlaqueCardRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlaqueCardServiceImpl implements PlaqueCardService {

    private final PlaqueCardRepository plaqueCardRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final SystemEmailService systemEmailService;

    @Override
    @Transactional
    public PlaqueCardDto getPlaqueCardByUserId(Long userId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found for user ID: " + userId));

        PlaqueCard plaqueCard = plaqueCardRepository.findByCandidateId(candidate.getId())
                .orElseGet(() -> {
                    log.info("No plaque card found for candidate {}. Generating default template.", candidate.getId());
                    PlaqueCard defaultCard = createDefaultCard(candidate);
                    return plaqueCardRepository.save(defaultCard);
                });

        return mapToDto(plaqueCard);
    }

    @Override
    @Transactional
    public PlaqueCardDto updatePlaqueCard(Long userId, PlaqueCardDto dto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found for user ID: " + userId));

        PlaqueCard plaqueCard = plaqueCardRepository.findByCandidateId(candidate.getId())
                .orElseGet(() -> createDefaultCard(candidate));

        plaqueCard.setThemeConfig(dto.getThemeConfig());
        plaqueCard.setSettings(dto.getSettings());
        plaqueCard.setElements(dto.getElements());

        PlaqueCard saved = plaqueCardRepository.save(plaqueCard);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public com.backend.autoapplypro.modules.users.dto.PublicPlaqueCardResponse getPublicPlaqueCardByUsername(String username) {
        String cleanUsername = username.trim().toLowerCase();
        
        // Ensure user profile is public
        User user = userRepository.findByUsername(cleanUsername)
                .orElseThrow(() -> new NoSuchElementException("Profile not found or is private."));

        if (!Boolean.TRUE.equals(user.getIsProfilePublic())) {
            throw new IllegalStateException("Profile is set to private.");
        }

        Candidate candidate = user.getCandidate();
        if (candidate == null) {
            throw new IllegalArgumentException("Plaque card only available for candidates.");
        }

        PlaqueCard plaqueCard = plaqueCardRepository.findByCandidateId(candidate.getId())
                .orElseGet(() -> {
                    log.info("No plaque card found for public candidate {}. Generating temporary default template.", candidate.getId());
                    return createDefaultCard(candidate);
                });

        List<com.backend.autoapplypro.modules.users.dto.AchievementDto> achievements = new ArrayList<>();
        if (candidate.getAchievements() != null) {
            for (com.backend.autoapplypro.modules.users.model.Achievement ach : candidate.getAchievements()) {
                achievements.add(com.backend.autoapplypro.modules.users.dto.AchievementDto.builder()
                        .id(ach.getId())
                        .title(ach.getTitle())
                        .description(ach.getDescription())
                        .category(ach.getCategory())
                        .badgeUrl(ach.getBadgeUrl())
                        .trustScore(ach.getTrustScore())
                        .build());
            }
        }

        List<String> skillsList = new ArrayList<>();
        if (candidate.getSkills() != null) {
            for (com.backend.autoapplypro.modules.users.model.Skill sk : candidate.getSkills()) {
                skillsList.add(sk.getName());
            }
        }

        return com.backend.autoapplypro.modules.users.dto.PublicPlaqueCardResponse.builder()
                .card(mapToDto(plaqueCard))
                .userId(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .isVerified(candidate.getIsVerified())
                .professionalVertical(user.getProfessionalVertical() != null ? user.getProfessionalVertical().name() : "DEVELOPER")
                .summary(candidate.getSummary())
                .skills(skillsList)
                .education(candidate.getEducation())
                .experience(candidate.getExperience())
                .achievements(achievements)
                .githubUsername(candidate.getGithubUsername())
                .githubProfileUrl(candidate.getGithubProfileUrl())
                .linkedinName(candidate.getLinkedinName())
                .linkedinProfileUrl(candidate.getLinkedinProfileUrl())
                .leetcodeUsername(candidate.getLeetcodeUsername())
                .githubStats(candidate.getGithubStats())
                .leetcodeStats(candidate.getLeetcodeStats())
                .build();
    }

    @Override
    public void sendContactEmail(String username, PlaqueCardContactRequest request) {
        String cleanUsername = username.trim().toLowerCase();
        User user = userRepository.findByUsername(cleanUsername)
                .orElseThrow(() -> new NoSuchElementException("Profile not found."));

        if (user.getCandidate() == null) {
            throw new IllegalArgumentException("User is not a candidate.");
        }

        PlaqueCard plaqueCard = plaqueCardRepository.findByCandidateId(user.getCandidate().getId())
                .orElseGet(() -> createDefaultCard(user.getCandidate()));

        // Double check if contact form is disabled
        Map<String, Object> settings = plaqueCard.getSettings();
        if (settings != null && settings.containsKey("showContactForm") && !Boolean.TRUE.equals(settings.get("showContactForm"))) {
            throw new IllegalStateException("This candidate's contact form is disabled.");
        }

        systemEmailService.sendPlaqueCardContactEmail(
                user.getEmail(),
                user.getName(),
                request.getName(),
                request.getEmail(),
                request.getCompany(),
                request.getMessage()
        );
    }

    private PlaqueCardDto mapToDto(PlaqueCard card) {
        return PlaqueCardDto.builder()
                .id(card.getId())
                .themeConfig(card.getThemeConfig())
                .settings(card.getSettings())
                .elements(card.getElements())
                .build();
    }

    private PlaqueCard createDefaultCard(Candidate candidate) {
        Map<String, Object> settings = new HashMap<>();
        settings.put("displayName", candidate.getUser().getName());
        settings.put("customHeadline", candidate.getUser().getProfessionalVertical() != null ? 
            candidate.getUser().getProfessionalVertical().name().replace("_", " ") : "Professional Candidate");
        settings.put("customLocation", "Bengaluru, India");
        settings.put("customSummary", candidate.getSummary() != null ? candidate.getSummary() : "");
        settings.put("portfolioUrl", "");
        settings.put("githubUrl", candidate.getGithubProfileUrl() != null ? candidate.getGithubProfileUrl() : "");
        settings.put("linkedinUrl", candidate.getLinkedinProfileUrl() != null ? candidate.getLinkedinProfileUrl() : "");
        settings.put("leetcodeUsername", candidate.getLeetcodeUsername() != null ? candidate.getLeetcodeUsername() : "");
        
        settings.put("showAvatar", true);
        settings.put("showLocation", true);
        settings.put("showSummary", candidate.getSummary() != null && !candidate.getSummary().trim().isEmpty());
        settings.put("showSkills", candidate.getSkills() != null && !candidate.getSkills().isEmpty());
        settings.put("showExperience", candidate.getExperience() != null && !candidate.getExperience().isEmpty());
        settings.put("showEducation", candidate.getEducation() != null && !candidate.getEducation().isEmpty());
        settings.put("showResume", candidate.getResumeBytes() != null);
        settings.put("showContactForm", true);

        return PlaqueCard.builder()
                .candidate(candidate)
                .themeConfig(new HashMap<>())
                .settings(settings)
                .elements(new ArrayList<>())
                .build();
    }
}
