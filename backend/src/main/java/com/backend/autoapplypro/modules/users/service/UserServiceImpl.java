package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.config.JwtUtil;
import com.backend.autoapplypro.modules.users.dto.*;
import com.backend.autoapplypro.modules.users.model.*;
import com.backend.autoapplypro.modules.users.repository.*;
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
    private final CandidateRepository candidateRepository;
    private final RecruiterRepository recruiterRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final SkillRepository skillRepository;
    private final JwtUtil jwtUtil;
    private final UserActivityLogRepository userActivityLogRepository;
    private final SystemEmailService systemEmailService;
    private final MarketingEmailCampaignService marketingCampaignService;

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

        // Create User
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .name(request.getName())
                .mobile(request.getMobile())
                .loginStreak(1)
                .lastLoginDate(today)
                .build();

        user = userRepository.save(user);

        // Send welcome email immediately
        marketingCampaignService.sendWelcomeEmail(user);

        // Log LOGIN activity
        userActivityLogRepository.save(UserActivityLog.builder()
                .user(user)
                .activityType("LOGIN")
                .activityDate(today)
                .build());

        // Create associated profile based on role
        if (role == UserRole.CANDIDATE) {
            Candidate candidate = Candidate.builder()
                    .user(user)
                    .skills(new java.util.HashSet<>())
                    .jobPreferences(new java.util.HashMap<>())
                    .build();
            candidateRepository.save(candidate);
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
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .officialEmail(user.getOfficialEmail())
                .role(user.getRole().name())
                .loginStreak(user.getLoginStreak())
                .build();
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
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateProfileDto getCandidateProfile(Long userId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));
        User user = candidate.getUser();
        return CandidateProfileDto.builder()
                .id(candidate.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .officialEmail(user.getOfficialEmail())
                .skills(candidate.getSkills() != null ? candidate.getSkills().stream().map(Skill::getName).collect(java.util.stream.Collectors.toList()) : new ArrayList<>())
                .jobPreferences(candidate.getJobPreferences())
                .resumeFilename(candidate.getResumeFilename())
                .summary(candidate.getSummary())
                .education(candidate.getEducation())
                .experience(candidate.getExperience())
                .certifications(candidate.getCertifications())
                .githubUsername(candidate.getGithubUsername())
                .githubProfileUrl(candidate.getGithubProfileUrl())
                .linkedinProfileUrl(candidate.getLinkedinProfileUrl())
                .linkedinName(candidate.getLinkedinName())
                .build();
    }

    @Override
    @Transactional
    public CandidateProfileDto updateCandidateProfile(Long userId, CandidateProfileDto dto) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));
        User user = candidate.getUser();
        
        user.setName(dto.getName());
        user.setMobile(dto.getMobile());
        user.setOfficialEmail(dto.getOfficialEmail());
        userRepository.save(user);

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
        candidate.setGithubUsername(dto.getGithubUsername());
        candidate.setGithubProfileUrl(dto.getGithubProfileUrl());
        candidate.setLinkedinProfileUrl(dto.getLinkedinProfileUrl());
        candidate.setLinkedinName(dto.getLinkedinName());
        candidate = candidateRepository.save(candidate);

        return CandidateProfileDto.builder()
                .id(candidate.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .officialEmail(user.getOfficialEmail())
                .skills(candidate.getSkills().stream().map(Skill::getName).collect(java.util.stream.Collectors.toList()))
                .jobPreferences(candidate.getJobPreferences())
                .resumeFilename(candidate.getResumeFilename())
                .summary(candidate.getSummary())
                .education(candidate.getEducation())
                .experience(candidate.getExperience())
                .certifications(candidate.getCertifications())
                .githubUsername(candidate.getGithubUsername())
                .githubProfileUrl(candidate.getGithubProfileUrl())
                .linkedinProfileUrl(candidate.getLinkedinProfileUrl())
                .linkedinName(candidate.getLinkedinName())
                .build();
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
                .build();
    }

    @Override
    @Transactional
    public void uploadResume(Long userId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));
        candidate.setResumeFilename(file.getOriginalFilename());
        candidate.setResumeContentType(file.getContentType());
        candidate.setResumeBytes(file.getBytes());
        candidateRepository.save(candidate);
    }

    @Override
    @Transactional
    public void syncProfileFromResume(Long userId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));
        
        if (candidate.getResumeBytes() == null || candidate.getResumeBytes().length == 0) {
            throw new IllegalStateException("No resume uploaded to sync profile from.");
        }

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String requestUrl = pythonServiceUrl + "/parse-resume";

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

            final String filename = candidate.getResumeFilename() != null ? candidate.getResumeFilename() : "resume.pdf";
            org.springframework.core.io.ByteArrayResource fileResource = new org.springframework.core.io.ByteArrayResource(candidate.getResumeBytes()) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("file", fileResource);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = 
                new org.springframework.http.HttpEntity<>(body, headers);

            org.springframework.http.ResponseEntity<ParsedResumeDto> response = restTemplate.postForEntity(
                requestUrl,
                requestEntity,
                ParsedResumeDto.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ParsedResumeDto parsed = response.getBody();
                candidate.setSummary(parsed.getSummary());
                candidate.setEducation(parsed.getEducation());
                candidate.setExperience(parsed.getExperience());
                candidate.setCertifications(parsed.getCertifications());

                // Update/link skills
                if (parsed.getSkills() != null) {
                    java.util.Set<Skill> dbSkills = candidate.getSkills();
                    if (dbSkills == null) {
                        dbSkills = new java.util.HashSet<>();
                    }
                    for (String skillName : parsed.getSkills()) {
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
                    candidate.setSkills(dbSkills);
                }
                candidateRepository.save(candidate);
            } else {
                throw new RuntimeException("Python AI parsing service returned an error status.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to sync profile from resume: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Candidate getCandidateResume(Long userId) {
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));
        // Force eager initialization of lazy @Lob resumeBytes while the transaction is active
        if (candidate.getResumeBytes() != null) {
            int length = candidate.getResumeBytes().length;
        }
        return candidate;
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
