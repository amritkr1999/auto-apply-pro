package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SocialOAuthService {

    private final UserRepository userRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final MarketingEmailCampaignService marketingCampaignService;

    @Transactional
    public User processLinkedinLogin(String email, String linkedinName, String linkedinProfileUrl) {
        if (email == null || email.isEmpty()) {
            email = (linkedinName != null && !linkedinName.isEmpty() ? linkedinName.replaceAll("\\s+", ".").toLowerCase() : "linkedin.user") + "@linkedin.com";
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            String randomPassword = UUID.randomUUID().toString();
            user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(randomPassword))
                    .role(UserRole.CANDIDATE)
                    .name(linkedinName != null && !linkedinName.isEmpty() ? linkedinName : "LinkedIn User")
                    .mobile("1234567890")
                    .loginStreak(1)
                    .lastLoginDate(LocalDate.now())
                    .isEmailVerified(true)
                    .build();
            user = userRepository.saveAndFlush(user);
            try {
                marketingCampaignService.sendWelcomeEmail(user);
            } catch (Exception ex) {
                log.error("Failed to send welcome email for LinkedIn user: {}", email, ex);
            }

            ProfessionalProfile candidate = ProfessionalProfile.builder()
                    .user(user)
                    .profileName("Default Profile")
                    .linkedinName(linkedinName)
                    .linkedinProfileUrl(linkedinProfileUrl)
                    .isVerified(true)
                    .skills(new HashSet<>())
                    .jobPreferences(new HashMap<>())
                    .build();
            professionalProfileRepository.saveAndFlush(candidate);
        } else {
            if (user.getRole() != UserRole.RECRUITER && user.getRole() != UserRole.COMPANY) {
                final User existingUser = user;
                ProfessionalProfile candidate = professionalProfileRepository.findByUserId(existingUser.getId())
                        .orElseGet(() -> ProfessionalProfile.builder()
                                .user(existingUser)
                                .profileName("Default Profile")
                                .skills(new HashSet<>())
                                .jobPreferences(new HashMap<>())
                                .build());
                candidate.setLinkedinName(linkedinName);
                candidate.setLinkedinProfileUrl(linkedinProfileUrl);
                candidate.setIsVerified(true);
                if (candidate.getProfileName() == null) {
                    candidate.setProfileName("Default Profile");
                }
                professionalProfileRepository.saveAndFlush(candidate);
            }
        }
        return user;
    }

    @Transactional
    public void connectLinkedinUser(Long userId, String linkedinName, String linkedinProfileUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        ProfessionalProfile candidate = professionalProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> ProfessionalProfile.builder()
                        .user(user)
                        .profileName("Default Profile")
                        .skills(new HashSet<>())
                        .jobPreferences(new HashMap<>())
                        .build());
        candidate.setLinkedinName(linkedinName);
        candidate.setLinkedinProfileUrl(linkedinProfileUrl);
        candidate.setIsVerified(true);
        if (candidate.getProfileName() == null) {
            candidate.setProfileName("Default Profile");
        }
        professionalProfileRepository.saveAndFlush(candidate);
    }

    @Transactional
    public User processGithubLogin(String email, String githubUsername, String githubProfileUrl) {
        if (email == null || email.isEmpty()) {
            email = (githubUsername != null ? githubUsername : "github-user") + "@github.com";
        }
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            String randomPassword = UUID.randomUUID().toString();
            user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(randomPassword))
                    .role(UserRole.CANDIDATE)
                    .name(githubUsername != null ? githubUsername : "GitHub User")
                    .mobile("1234567890")
                    .loginStreak(1)
                    .lastLoginDate(LocalDate.now())
                    .isEmailVerified(true)
                    .build();
            user = userRepository.saveAndFlush(user);
            try {
                marketingCampaignService.sendWelcomeEmail(user);
            } catch (Exception ex) {
                log.error("Failed to send welcome email for GitHub user: {}", email, ex);
            }

            ProfessionalProfile candidate = ProfessionalProfile.builder()
                    .user(user)
                    .profileName("Default Profile")
                    .githubUsername(githubUsername)
                    .githubProfileUrl(githubProfileUrl)
                    .isVerified(true)
                    .skills(new HashSet<>())
                    .jobPreferences(new HashMap<>())
                    .build();
            professionalProfileRepository.saveAndFlush(candidate);
        } else {
            if (user.getRole() != UserRole.RECRUITER && user.getRole() != UserRole.COMPANY) {
                final User existingUser = user;
                ProfessionalProfile candidate = professionalProfileRepository.findByUserId(existingUser.getId())
                        .orElseGet(() -> ProfessionalProfile.builder()
                                .user(existingUser)
                                .profileName("Default Profile")
                                .skills(new HashSet<>())
                                .jobPreferences(new HashMap<>())
                                .build());
                candidate.setGithubUsername(githubUsername);
                candidate.setGithubProfileUrl(githubProfileUrl);
                candidate.setIsVerified(true);
                if (candidate.getProfileName() == null) {
                    candidate.setProfileName("Default Profile");
                }
                professionalProfileRepository.saveAndFlush(candidate);
            }
        }
        return user;
    }

    @Transactional
    public void connectGithubUser(Long userId, String githubUsername, String githubProfileUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        ProfessionalProfile candidate = professionalProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> ProfessionalProfile.builder()
                        .user(user)
                        .profileName("Default Profile")
                        .skills(new HashSet<>())
                        .jobPreferences(new HashMap<>())
                        .build());
        candidate.setGithubUsername(githubUsername);
        candidate.setGithubProfileUrl(githubProfileUrl);
        candidate.setIsVerified(true);
        if (candidate.getProfileName() == null) {
            candidate.setProfileName("Default Profile");
        }
        professionalProfileRepository.saveAndFlush(candidate);
    }
}
