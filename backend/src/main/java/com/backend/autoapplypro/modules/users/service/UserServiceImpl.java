package com.backend.autoapplypro.modules.users.service;

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

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            // Dev bypass: if user exists, just return them instead of throwing error
            User existingUser = userRepository.findByEmail(request.getEmail()).get();
            return AuthResponse.builder()
                    .token("mock-jwt-token-for-" + existingUser.getEmail())
                    .id(existingUser.getId())
                    .email(existingUser.getEmail())
                    .name(existingUser.getName())
                    .mobile(existingUser.getMobile())
                    .role(existingUser.getRole().name())
                    .build();
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }

        // Create User
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .name(request.getName())
                .mobile(request.getMobile())
                .build();

        user = userRepository.save(user);

        // Create associated profile based on role
        if (role == UserRole.CANDIDATE) {
            Candidate candidate = Candidate.builder()
                    .user(user)
                    .skills(new java.util.HashSet<>())
                    .jobPreferences(new HashMap<>())
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

        return AuthResponse.builder()
                .token("mock-jwt-token-for-" + user.getEmail())
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Find user by email or auto-register if not present during development
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(request.getEmail())
                            .passwordHash(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "password"))
                            .role(UserRole.CANDIDATE)
                            .name("Developer User")
                            .mobile("1234567890")
                            .build();
                    newUser = userRepository.save(newUser);
                    
                    Candidate candidate = Candidate.builder()
                            .user(newUser)
                            .skills(new java.util.HashSet<>())
                            .jobPreferences(new HashMap<>())
                            .build();
                    candidateRepository.save(candidate);
                    return newUser;
                });

        // Commented out for development to allow everything
        /*
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        */

        return AuthResponse.builder()
                .token("mock-jwt-token-for-" + user.getEmail())
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .role(user.getRole().name())
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
                .skills(candidate.getSkills() != null ? candidate.getSkills().stream().map(Skill::getName).collect(java.util.stream.Collectors.toList()) : new ArrayList<>())
                .jobPreferences(candidate.getJobPreferences())
                .resumeFilename(candidate.getResumeFilename())
                .summary(candidate.getSummary())
                .education(candidate.getEducation())
                .experience(candidate.getExperience())
                .certifications(candidate.getCertifications())
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
        candidate = candidateRepository.save(candidate);

        return CandidateProfileDto.builder()
                .id(candidate.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .mobile(user.getMobile())
                .skills(candidate.getSkills().stream().map(Skill::getName).collect(java.util.stream.Collectors.toList()))
                .jobPreferences(candidate.getJobPreferences())
                .resumeFilename(candidate.getResumeFilename())
                .summary(candidate.getSummary())
                .education(candidate.getEducation())
                .experience(candidate.getExperience())
                .certifications(candidate.getCertifications())
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

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String pythonServiceUrl = "http://localhost:8000/parse-resume";

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

            final String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
            org.springframework.core.io.ByteArrayResource fileResource = new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
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
                pythonServiceUrl,
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
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to parse resume with Python AI service. File saved without parsing. Error: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Candidate getCandidateResume(Long userId) {
        return candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));
    }
}
