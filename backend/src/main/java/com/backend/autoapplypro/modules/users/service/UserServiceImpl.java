package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.config.JwtUtil;
import com.backend.autoapplypro.modules.users.dto.*;
import com.backend.autoapplypro.modules.users.model.*;
import com.backend.autoapplypro.modules.users.repository.*;
import com.backend.autoapplypro.modules.users.public_profile.evidence.EvidenceEngine;
import com.backend.autoapplypro.modules.users.public_profile.evidence.EvidenceProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final RecruiterRepository recruiterRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final SkillRepository skillRepository;
    private final JwtUtil jwtUtil;
    private final UserActivityLogRepository userActivityLogRepository;
    private final SystemEmailService systemEmailService;
    private final MarketingEmailCampaignService marketingCampaignService;
    private final JavaResumeParserService javaResumeParserService;
    private final EvidenceEngine evidenceEngine;

    @org.springframework.beans.factory.annotation.Value("${pipeline.service.url:http://localhost:8000}")
    private String pythonServiceUrl;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime trialEnd = now.plusDays(15);
        String otpCode = String.valueOf(100000 + new java.security.SecureRandom().nextInt(900000));

        // Create User with 15-Day Elite Autopilot Free Trial
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .name(request.getName())
                .mobile(request.getMobile())
                .loginStreak(0)
                .lastLoginDate(today)
                .isEmailVerified(true)
                .dailyLimit(50)
                .trialStartAt(now)
                .trialEndAt(trialEnd)
                .trialTier("ELITE_AUTOPILOT")
                .trialUsed(true)
                .build();

        user = userRepository.save(user);

        // Create associated profile based on role
        if (role == UserRole.CANDIDATE) {
            ProfessionalProfile candidate = ProfessionalProfile.builder()
                    .user(user)
                    .skills(new java.util.HashSet<>())
                    .jobPreferences(new java.util.HashMap<>())
                    .profileName("Default Profile")
                    .isDefault(true)
                    .build();
            professionalProfileRepository.save(candidate);
        } else if (role == UserRole.RECRUITER) {
            Recruiter recruiter = Recruiter.builder()
                    .user(user)
                    .name(user.getName())
                    .email(user.getEmail())
                    .build();
            recruiterRepository.save(recruiter);
        } else if (role == UserRole.COMPANY) {
            Company company = Company.builder()
                    .user(user)
                    .name(user.getName()) // Use input name as company name
                    .industry("Not Specified")
                    .build();
            companyRepository.save(company);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return mapToAuthResponse(user, token);
    }

    @Override
    @Transactional
    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            return AuthResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .mobile(user.getMobile())
                    .officialEmail(user.getOfficialEmail())
                    .role(user.getRole().name())
                    .loginStreak(user.getLoginStreak())
                    .avatar(user.getAvatar())
                    .isEmailVerified(true)
                    .requiresVerification(false)
                    .build();
        }

        if (user.getEmailVerificationToken() == null || !user.getEmailVerificationToken().equals(request.getToken().trim())) {
            throw new IllegalArgumentException("Invalid verification code or link.");
        }

        if (user.getEmailVerificationTokenExpiry() == null || user.getEmailVerificationTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new verification code.");
        }

        // Verification successful
        user.setIsEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        user.setLoginStreak(1);
        user.setLastLoginDate(java.time.LocalDate.now());
        user = userRepository.save(user);

        // Send welcome email on verification
        marketingCampaignService.sendWelcomeEmail(user);

        // Log LOGIN activity
        userActivityLogRepository.save(UserActivityLog.builder()
                .user(user)
                .activityType("LOGIN")
                .activityDate(java.time.LocalDate.now())
                .build());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .officialEmail(user.getOfficialEmail())
                .role(user.getRole().name())
                .loginStreak(user.getLoginStreak())
                .avatar(user.getAvatar())
                .isEmailVerified(true)
                .requiresVerification(false)
                .build();
    }

    @Override
    @Transactional
    public void resendVerification(ResendVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));

        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new IllegalArgumentException("Email is already verified. You can log in directly.");
        }

        String otpCode = String.valueOf(100000 + new java.security.SecureRandom().nextInt(900000));
        user.setEmailVerificationToken(otpCode);
        user.setEmailVerificationTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        try {
            String verificationLink = "http://localhost:5173/verify-email?token=" + otpCode + "&email=" + user.getEmail();
            systemEmailService.sendEmailVerificationEmail(user.getEmail(), verificationLink, otpCode);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(UserServiceImpl.class).error("Failed to resend verification email: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (request.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        /*
        if (Boolean.FALSE.equals(user.getIsEmailVerified())) {
            throw new IllegalArgumentException("Your email address is not verified. Please check your email for the verification code or request a new one.");
        }
        */

        // Calculate login streak
        java.time.LocalDate today = java.time.LocalDate.now();
        if (user.getLastLoginDate() == null) {
            user.setLoginStreak(1);
            user.setLastLoginDate(today);
        } else {
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(user.getLastLoginDate(), today);
            if (daysBetween == 1) {
                user.setLoginStreak(user.getLoginStreak() + 1);
                user.setLastLoginDate(today);
            } else if (daysBetween > 1) {
                user.setLoginStreak(1);
                user.setLastLoginDate(today);
            }
            // if daysBetween == 0, keep current streak and date (already logged in today)
        }
        user = userRepository.save(user);

        // Save LOGIN activity log
        userActivityLogRepository.save(UserActivityLog.builder()
                .user(user)
                .activityType("LOGIN")
                .activityDate(today)
                .build());

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return mapToAuthResponse(user, token);
    }

    private AuthResponse mapToAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .officialEmail(user.getOfficialEmail())
                .role(user.getRole().name())
                .loginStreak(user.getLoginStreak())
                .isPendingDeletion(user.getStatus() == UserStatus.PENDING_DELETION)
                .deletionScheduledAt(user.getDeletionScheduledAt() != null ? user.getDeletionScheduledAt().toString() : null)
                .avatar(user.getAvatar())
                .isEmailVerified(Boolean.TRUE.equals(user.getIsEmailVerified()))
                .requiresVerification(!Boolean.TRUE.equals(user.getIsEmailVerified()))
                .isTrialActive(user.isTrialActive())
                .trialDaysRemaining(user.getTrialDaysRemaining())
                .trialEndAt(user.getTrialEndAt() != null ? user.getTrialEndAt().toString() : null)
                .trialTier(user.getTrialTier())
                .trialUsed(user.getTrialUsed())
                .build();
    }

    private boolean isCandidateRole(UserRole role) {
        if (role == null) return false;
        return role != UserRole.RECRUITER && role != UserRole.COMPANY;
    }

    private ProfessionalProfile getOrCreateCandidate(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!isCandidateRole(user.getRole())) {
            throw new IllegalArgumentException("User is not a candidate");
        }
        return professionalProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    ProfessionalProfile newCand = ProfessionalProfile.builder()
                            .user(user)
                            .skills(new java.util.HashSet<>())
                            .jobPreferences(new java.util.HashMap<>())
                            .isVerified(false)
                            .profileName("Default Profile")
                            .isDefault(true)
                            .build();
                    return professionalProfileRepository.save(newCand);
                });
    }

    private ProfessionalProfile getOrCreateCandidateProfile(Long userId, Long profileId) {
        if (profileId == null) {
            return getOrCreateCandidate(userId);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!isCandidateRole(user.getRole())) {
            throw new IllegalArgumentException("User is not a candidate");
        }
        ProfessionalProfile profile = professionalProfileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found with id: " + profileId));
        if (!profile.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Profile does not belong to the user");
        }
        return profile;
    }

    private CandidateProfileDto mapToDto(ProfessionalProfile candidate) {
        User user = candidate.getUser();
        return CandidateProfileDto.builder()
                .id(candidate.getId())
                .userId(user.getId())
                .profileName(candidate.getProfileName())
                .isDefault(candidate.getIsDefault())
                .targetTemplateId(candidate.getTargetTemplateId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .officialEmail(user.getOfficialEmail())
                .skills(candidate.getSkills() != null ? candidate.getSkills().stream().map(Skill::getName).collect(java.util.stream.Collectors.toList()) : new ArrayList<>())
                .jobPreferences(candidate.getJobPreferences())
                .resumeFilename(candidate.getResumeFilename())
                .coverLetterFilename(candidate.getCoverLetterFilename())
                .coverLetterContentType(candidate.getCoverLetterContentType())
                .hasCoverLetter(candidate.getCoverLetterBytes() != null && candidate.getCoverLetterBytes().length > 0)
                .defaultCoverLetterMode(candidate.getDefaultCoverLetterMode() != null ? candidate.getDefaultCoverLetterMode() : "TEMPLATE")
                .defaultCoverLetterDeliveryType(candidate.getDefaultCoverLetterDeliveryType() != null ? candidate.getDefaultCoverLetterDeliveryType() : "ATTACHMENT")
                .defaultCoverLetterTemplateId(candidate.getDefaultCoverLetterTemplateId())
                .summary(candidate.getSummary())
                .education(candidate.getEducation())
                .experience(candidate.getExperience())
                .certifications(candidate.getCertifications())
                .githubUsername(candidate.getGithubUsername())
                .githubProfileUrl(candidate.getGithubProfileUrl())
                .linkedinProfileUrl(candidate.getLinkedinProfileUrl())
                .linkedinName(candidate.getLinkedinName())
                .avatar(user.getAvatar())
                .isProfilePublic(user.getIsProfilePublic())
                .username(user.getUsername())
                .githubStats(candidate.getGithubStats())
                .leetcodeStats(candidate.getLeetcodeStats())
                .leetcodeUsername(candidate.getLeetcodeUsername())
                .isVerified(candidate.getIsVerified())
                .professionalVertical(user.getProfessionalVertical() != null ? user.getProfessionalVertical().name() : null)
                .trustScore(evidenceEngine != null && evidenceEngine.getProvider(user.getProfessionalVertical()) != null ? evidenceEngine.getProvider(user.getProfessionalVertical()).calculateTrustScore(user) : 10)
                .achievements(candidate.getAchievements() != null ? candidate.getAchievements().stream()
                        .map(ach -> AchievementDto.builder()
                                .id(ach.getId())
                                .title(ach.getTitle())
                                .description(ach.getDescription())
                                .category(ach.getCategory())
                                .badgeUrl(ach.getBadgeUrl())
                                .verificationStatus(ach.getVerificationStatus() != null ? ach.getVerificationStatus().name() : "NONE")
                                .trustScore(ach.getTrustScore())
                                .isVerified(ach.getIsVerified())
                                .build())
                        .collect(java.util.stream.Collectors.toList()) : new java.util.ArrayList<>())
                .excludedCompanies(candidate.getExcludedCompanies() != null ? candidate.getExcludedCompanies() : new java.util.ArrayList<>())
                .build();
    }

    @Override
    @Transactional
    public CandidateProfileDto getCandidateProfile(Long userId) {
        ProfessionalProfile candidate = getOrCreateCandidate(userId);
        return mapToDto(candidate);
    }

    private CandidateProfileDto updateProfileInternal(ProfessionalProfile candidate, CandidateProfileDto dto) {
        User user = candidate.getUser();
        
        user.setName(dto.getName());
        user.setMobile(dto.getMobile());
        user.setOfficialEmail(dto.getOfficialEmail());
        user.setAvatar(dto.getAvatar());
        if (dto.getIsProfilePublic() != null) {
            user.setIsProfilePublic(dto.getIsProfilePublic());
        }
        if (dto.getProfessionalVertical() != null) {
            try {
                user.setProfessionalVertical(com.backend.autoapplypro.modules.users.model.ProfessionalVertical.valueOf(dto.getProfessionalVertical().toUpperCase()));
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid professional vertical: " + dto.getProfessionalVertical());
            }
        }
        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty()) {
            String newUsername = dto.getUsername().trim().toLowerCase().replaceAll("[^a-zA-Z0-9_]", "");
            if (!newUsername.isEmpty() && !newUsername.equals(user.getUsername())) {
                if (userRepository.existsByUsername(newUsername)) {
                    throw new IllegalArgumentException("Username is already taken");
                }
                user.setUsername(newUsername);
            }
        }
        userRepository.save(user);

        if (dto.getProfileName() != null && !dto.getProfileName().trim().isEmpty()) {
            candidate.setProfileName(dto.getProfileName().trim());
        }
        if (dto.getTargetTemplateId() != null) {
            candidate.setTargetTemplateId(dto.getTargetTemplateId());
        }

        java.util.Set<Skill> dbSkills = new java.util.HashSet<>();
        if (dto.getSkills() != null) {
            for (String skillName : dto.getSkills()) {
                String trimmedName = skillName.trim();
                if (!trimmedName.isEmpty()) {
                    Skill skill = skillRepository.findByNameIgnoreCase(trimmedName)
                            .orElseGet(() -> {
                                Skill newSkill = Skill.builder().name(trimmedName).build();
                                return skillRepository.save(newSkill);
                            });
                    dbSkills.add(skill);
                }
            }
        }
        candidate.setSkills(dbSkills);
        candidate.setJobPreferences(dto.getJobPreferences());
        candidate.setSummary(dto.getSummary());
        candidate.setEducation(dto.getEducation());
        candidate.setExperience(dto.getExperience());
        candidate.setCertifications(dto.getCertifications());
        candidate.setExcludedCompanies(dto.getExcludedCompanies() != null ? dto.getExcludedCompanies() : new java.util.ArrayList<>());
        candidate.setGithubUsername(dto.getGithubUsername());
        candidate.setGithubProfileUrl(dto.getGithubProfileUrl());
        candidate.setLinkedinProfileUrl(dto.getLinkedinProfileUrl());
        candidate.setLinkedinName(dto.getLinkedinName());
        
        candidate.setLeetcodeUsername(dto.getLeetcodeUsername());
        if (dto.getLeetcodeUsername() == null || dto.getLeetcodeUsername().trim().isEmpty()) {
            candidate.setLeetcodeStats(null);
        }

        if (candidate.getGithubUsername() == null || candidate.getGithubUsername().trim().isEmpty()) {
            candidate.setGithubStats(null);
        }

        // Trigger / hook: if user manually edits a previously 'VERIFIED' achievement, reset status and score
        if (dto.getAchievements() != null) {
            java.util.List<Achievement> currentAchievements = candidate.getAchievements();
            if (currentAchievements == null) {
                currentAchievements = new java.util.ArrayList<>();
                candidate.setAchievements(currentAchievements);
            }

            java.util.Map<Long, Achievement> currentMap = new java.util.HashMap<>();
            for (Achievement ach : currentAchievements) {
                if (ach.getId() != null) {
                    currentMap.put(ach.getId(), ach);
                }
            }

            java.util.List<Achievement> updatedAchievements = new java.util.ArrayList<>();
            for (AchievementDto achDto : dto.getAchievements()) {
                if (achDto.getId() != null && currentMap.containsKey(achDto.getId())) {
                    Achievement existing = currentMap.get(achDto.getId());

                    // Check for changes in title, description, category, or badgeUrl
                    boolean changed = !java.util.Objects.equals(existing.getTitle(), achDto.getTitle())
                            || !java.util.Objects.equals(existing.getDescription(), achDto.getDescription())
                            || !java.util.Objects.equals(existing.getCategory(), achDto.getCategory())
                            || !java.util.Objects.equals(existing.getBadgeUrl(), achDto.getBadgeUrl());

                    if (changed) {
                        if (existing.getVerificationStatus() == com.backend.autoapplypro.modules.users.public_profile.evidence.VerificationStatus.VERIFIED) {
                            existing.setVerificationStatus(com.backend.autoapplypro.modules.users.public_profile.evidence.VerificationStatus.NONE);
                            existing.setTrustScore(10); // baseline
                            existing.setIsVerified(false);
                        }
                    }

                    existing.setTitle(achDto.getTitle());
                    existing.setDescription(achDto.getDescription());
                    existing.setCategory(achDto.getCategory());
                    existing.setBadgeUrl(achDto.getBadgeUrl());

                    updatedAchievements.add(existing);
                } else {
                    // New Achievement
                    Achievement newAch = Achievement.builder()
                            .professionalProfile(candidate)
                            .title(achDto.getTitle())
                            .description(achDto.getDescription())
                            .category(achDto.getCategory())
                            .badgeUrl(achDto.getBadgeUrl())
                            .verificationStatus(com.backend.autoapplypro.modules.users.public_profile.evidence.VerificationStatus.NONE)
                            .trustScore(10)
                            .isVerified(false)
                            .build();
                    updatedAchievements.add(newAch);
                }
            }

            currentAchievements.clear();
            currentAchievements.addAll(updatedAchievements);
        }

        candidate = professionalProfileRepository.save(candidate);
        return mapToDto(candidate);
    }

    @Override
    @Transactional
    public CandidateProfileDto updateCandidateProfile(Long userId, CandidateProfileDto dto) {
        ProfessionalProfile candidate = getOrCreateCandidate(userId);
        return updateProfileInternal(candidate, dto);
    }

    @Override
    @Transactional
    public CandidateProfileDto updateCandidateProfile(Long userId, Long profileId, CandidateProfileDto dto) {
        ProfessionalProfile candidate = getOrCreateCandidateProfile(userId, profileId);
        return updateProfileInternal(candidate, dto);
    }

    @Override
    @Transactional(readOnly = true)
    public RecruiterProfileDto getRecruiterProfile(Long userId) {
        Recruiter recruiter = recruiterRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Recruiter profile not found"));
        User user = recruiter.getUser();
        
        Long companyId = recruiter.getCompany() != null ? recruiter.getCompany().getId() : null;
        String companyName = recruiter.getCompany() != null ? recruiter.getCompany().getName() : null;

        return RecruiterProfileDto.builder()
                .id(recruiter.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .officialEmail(user.getOfficialEmail())
                .companyId(companyId)
                .companyName(companyName)
                .avatar(user.getAvatar())
                .build();
    }

    @Override
    @Transactional
    public RecruiterProfileDto updateRecruiterProfile(Long userId, RecruiterProfileDto dto) {
        Recruiter recruiter = recruiterRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Recruiter profile not found"));
        User user = recruiter.getUser();

        user.setName(dto.getName());
        user.setMobile(dto.getMobile());
        user.setOfficialEmail(dto.getOfficialEmail());
        user.setAvatar(dto.getAvatar());
        userRepository.save(user);

        recruiter.setName(dto.getName());
        
        // Find or create company if specified
        if (dto.getCompanyName() != null && !dto.getCompanyName().trim().isEmpty()) {
            Company company = companyRepository.findByName(dto.getCompanyName())
                    .orElseGet(() -> {
                        Company newComp = Company.builder()
                                .name(dto.getCompanyName())
                                .industry("Not Specified")
                                .build();
                        return companyRepository.save(newComp);
                    });
            recruiter.setCompany(company);
        } else {
            recruiter.setCompany(null);
        }

        recruiter = recruiterRepository.save(recruiter);

        Long companyId = recruiter.getCompany() != null ? recruiter.getCompany().getId() : null;
        String companyName = recruiter.getCompany() != null ? recruiter.getCompany().getName() : null;

        return RecruiterProfileDto.builder()
                .id(recruiter.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .officialEmail(user.getOfficialEmail())
                .companyId(companyId)
                .companyName(companyName)
                .avatar(user.getAvatar())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyProfileDto getCompanyProfile(Long userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Company profile not found"));
        User user = company.getUser();

        return CompanyProfileDto.builder()
                .id(company.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .officialEmail(user.getOfficialEmail())
                .name(company.getName())
                .industry(company.getIndustry())
                .website(company.getWebsite())
                .description(company.getDescription())
                .avatar(user.getAvatar())
                .build();
    }

    @Override
    @Transactional
    public CompanyProfileDto updateCompanyProfile(Long userId, CompanyProfileDto dto) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Company profile not found"));
        
        // Update user (owner) name & mobile if desired, or keep it.
        User user = company.getUser();
        user.setName(dto.getName()); // Owner's name or company name update
        user.setOfficialEmail(dto.getOfficialEmail());
        user.setAvatar(dto.getAvatar());
        userRepository.save(user);

        company.setName(dto.getName());
        company.setIndustry(dto.getIndustry());
        company.setWebsite(dto.getWebsite());
        company.setDescription(dto.getDescription());
        
        company = companyRepository.save(company);

        return CompanyProfileDto.builder()
                .id(company.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .officialEmail(user.getOfficialEmail())
                .name(company.getName())
                .industry(company.getIndustry())
                .website(company.getWebsite())
                .description(company.getDescription())
                .avatar(user.getAvatar())
                .build();
    }

    @Override
    @Transactional
    public void uploadResume(Long userId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        ProfessionalProfile candidate = getOrCreateCandidate(userId);
        candidate.setResumeFilename(file.getOriginalFilename());
        candidate.setResumeContentType(file.getContentType());
        candidate.setResumeBytes(file.getBytes());
        professionalProfileRepository.save(candidate);
    }

    @Override
    @Transactional
    public void uploadResume(Long userId, Long profileId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        ProfessionalProfile candidate = getOrCreateCandidateProfile(userId, profileId);
        candidate.setResumeFilename(file.getOriginalFilename());
        candidate.setResumeContentType(file.getContentType());
        candidate.setResumeBytes(file.getBytes());
        professionalProfileRepository.save(candidate);
    }

    private ParsedResumeDto syncProfileFromResumeInternal(ProfessionalProfile candidate) {
        if (candidate.getResumeBytes() == null || candidate.getResumeBytes().length == 0) {
            throw new IllegalStateException("No resume uploaded to sync profile from.");
        }
        return javaResumeParserService.parseResume(
                candidate.getResumeBytes(),
                candidate.getResumeContentType(),
                candidate.getResumeFilename()
        );
    }

    @Override
    @Transactional
    public ParsedResumeDto syncProfileFromResume(Long userId) {
        ProfessionalProfile candidate = getOrCreateCandidate(userId);
        return syncProfileFromResumeInternal(candidate);
    }

    @Override
    @Transactional
    public ParsedResumeDto syncProfileFromResume(Long userId, Long profileId) {
        ProfessionalProfile candidate = getOrCreateCandidateProfile(userId, profileId);
        return syncProfileFromResumeInternal(candidate);
    }

    @Override
    @Transactional
    public ProfessionalProfile getCandidateResume(Long userId) {
        return getOrCreateCandidate(userId);
    }

    @Override
    @Transactional
    public ProfessionalProfile getCandidateResume(Long userId, Long profileId) {
        return getOrCreateCandidateProfile(userId, profileId);
    }

    @Override
    @Transactional
    public CandidateProfileDto getCandidateProfileById(Long userId, Long profileId) {
        ProfessionalProfile candidate = getOrCreateCandidateProfile(userId, profileId);
        return mapToDto(candidate);
    }

    @Override
    @Transactional
    public java.util.List<CandidateProfileDto> getCandidateProfiles(Long userId) {
        getOrCreateCandidate(userId); // ensure a default profile is created
        java.util.List<ProfessionalProfile> profiles = professionalProfileRepository.findAllByUserId(userId);
        return profiles.stream().map(this::mapToDto).collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public CandidateProfileDto createCandidateProfile(Long userId, String profileName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!isCandidateRole(user.getRole())) {
            throw new IllegalArgumentException("User is not a candidate");
        }
        
        java.util.List<ProfessionalProfile> existing = professionalProfileRepository.findAllByUserId(userId);
        boolean isFirst = existing.isEmpty();

        ProfessionalProfile newProfile = ProfessionalProfile.builder()
                .user(user)
                .skills(new java.util.HashSet<>())
                .jobPreferences(new java.util.HashMap<>())
                .isVerified(false)
                .profileName(profileName != null ? profileName.trim() : "New Profile")
                .isDefault(isFirst)
                .build();
        newProfile = professionalProfileRepository.save(newProfile);
        return mapToDto(newProfile);
    }

    @Override
    @Transactional
    public void selectDefaultProfile(Long userId, Long profileId) {
        java.util.List<ProfessionalProfile> profiles = professionalProfileRepository.findAllByUserId(userId);
        boolean found = false;
        for (ProfessionalProfile profile : profiles) {
            if (profile.getId().equals(profileId)) {
                profile.setIsDefault(true);
                found = true;
            } else {
                profile.setIsDefault(false);
            }
        }
        if (!found) {
            throw new IllegalArgumentException("Profile not found with id: " + profileId);
        }
        professionalProfileRepository.saveAll(profiles);
    }

    @Override
    @Transactional
    public void deleteCandidateProfile(Long userId, Long profileId) {
        ProfessionalProfile profile = getOrCreateCandidateProfile(userId, profileId);
        if (profile.getIsDefault()) {
            throw new IllegalArgumentException("Cannot delete the default profile. Please select another profile as default first.");
        }
        professionalProfileRepository.delete(profile);
    }

    @Override
    @Transactional
    public void initiatePasswordReset(ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        
        java.util.Optional<User> userOpt = userRepository.findByEmail(request.getEmail().trim());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = java.util.UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiry(java.time.LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);

            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            systemEmailService.sendPasswordResetEmail(user.getEmail(), resetLink);
        } else {
            // Log for security auditing without exposing to client
            System.out.println("[SECURITY] Password reset requested for non-existent email: " + request.getEmail());
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().trim().isEmpty()) {
            throw new IllegalArgumentException("Token is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        User user = userRepository.findByResetToken(request.getToken().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired");
        }

        // Reset password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        // Save activity log
        userActivityLogRepository.save(UserActivityLog.builder()
                .user(user)
                .activityType("PASSWORD_RESET")
                .activityDate(java.time.LocalDate.now())
                .build());
    }

    @Override
    @Transactional
    public void requestAccountDeletion(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setStatus(UserStatus.PENDING_DELETION);
        user.setDeletionScheduledAt(java.time.LocalDateTime.now().plusDays(14));
        userRepository.save(user);

        userActivityLogRepository.save(UserActivityLog.builder()
                .user(user)
                .activityType("DELETE_REQUEST")
                .activityDate(java.time.LocalDate.now())
                .build());
    }

    @Override
    @Transactional
    public void cancelAccountDeletion(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getStatus() == UserStatus.PENDING_DELETION) {
            user.setStatus(UserStatus.ACTIVE);
            user.setDeletionScheduledAt(null);
            userRepository.save(user);

            userActivityLogRepository.save(UserActivityLog.builder()
                    .user(user)
                    .activityType("DELETE_CANCEL")
                    .activityDate(java.time.LocalDate.now())
                    .build());
        }
    }
}
