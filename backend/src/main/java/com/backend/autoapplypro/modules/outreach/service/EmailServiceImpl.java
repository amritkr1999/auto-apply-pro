package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.config.EmailTemplateEngine;
import com.backend.autoapplypro.modules.jobs.model.JobPosting;
import com.backend.autoapplypro.modules.jobs.repository.JobPostingRepository;
import com.backend.autoapplypro.modules.outreach.dto.EmailGenerationRequestDto;
import com.backend.autoapplypro.modules.outreach.dto.EmailGenerationResponseDto;
import com.backend.autoapplypro.modules.users.dto.CandidateProfileDto;
import com.backend.autoapplypro.modules.users.model.Company;
import com.backend.autoapplypro.modules.users.repository.CompanyRepository;
import com.backend.autoapplypro.modules.users.service.UserService;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.billing.service.SubscriptionGatingService;
import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final CompanyRepository companyRepository;
    private final JobPostingRepository jobPostingRepository;
    private final UserService userService;
    private final EmailTemplateEngine templateEngine;
    private final CacheManager cacheManager;
    private final EmailTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final SubscriptionGatingService subscriptionGatingService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    @Lazy
    private EmailService self;

    @Value("${email.llm.service-url:http://localhost:8000/generate-hook}")
    private String llmServiceUrl;

    @Value("${email.llm.model.high-intel:gemini-1.5-pro}")
    private String highIntelModel;

    @Value("${email.llm.model.low-cost:gemini-1.5-flash}")
    private String lowCostModel;

    @Override
    public EmailGenerationResponseDto generateEmail(EmailGenerationRequestDto dto, boolean regenerate) {
        Long userId = dto.getUserId();
        String companyName = dto.getJobDetails().getCompany();
        String jobTitle = dto.getJobDetails().getTitle();

        log.info("Orchestrating email generation for User ID: {}, Company: {}, Role: {}, regenerate: {}, userTier: {}", 
                userId, companyName, jobTitle, regenerate, dto.getUserTier());

        // 1. Resolve Company ID (create if missing)
        Company company = companyRepository.findByName(companyName)
                .orElseGet(() -> {
                    log.info("Company '{}' not found. Creating placeholder entry.", companyName);
                    return companyRepository.save(Company.builder().name(companyName).build());
                });
        String companyId = String.valueOf(company.getId());

        // 2. Resolve Job/Role ID (create if missing)
        JobPosting job = jobPostingRepository.findByTitleAndCompany(jobTitle, companyName)
                .orElseGet(() -> {
                    log.info("Job Posting for '{}' at '{}' not found. Creating placeholder entry.", jobTitle, companyName);
                    return jobPostingRepository.save(JobPosting.builder()
                            .title(jobTitle)
                            .company(companyName)
                            .description(dto.getJobDetails().getDescription())
                            .requirements(dto.getJobDetails().getRequirements())
                            .salary(dto.getJobDetails().getSalary())
                            .sourceUrl(dto.getJobDetails().getSourceUrl())
                            .build());
                });
        String roleId = String.valueOf(job.getId());

        // 3. Determine if AI should be used based on toggle and subscription
        boolean isPremium = subscriptionGatingService.isPremiumUser(userId);
        User user = userRepository.findById(userId).orElse(null);
        boolean aiSettingEnabled = user != null && Boolean.TRUE.equals(user.getAiPersonalizationEnabled());

        boolean callAi = false;
        if (isPremium) {
            if (dto.getUseAi() != null) {
                callAi = dto.getUseAi();
            } else {
                callAi = aiSettingEnabled || regenerate;
            }
        } else {
            if (regenerate || (dto.getUseAi() != null && dto.getUseAi())) {
                log.warn("Access denied: Non-premium user ID {} attempted to use AI Hook. Falling back to deterministic hook.", userId);
            }
            callAi = false;
        }

        // 4. Fetch candidate details & construct minimized profile snippet (Data Minimization)
        CandidateProfileDto profile;
        if (dto.getProfileId() != null) {
            profile = userService.getCandidateProfileById(userId, dto.getProfileId());
        } else {
            profile = userService.getCandidateProfile(userId);
        }
        
        // Check if company is excluded
        if (profile.getExcludedCompanies() != null && !profile.getExcludedCompanies().isEmpty()) {
            boolean isExcluded = profile.getExcludedCompanies().stream()
                    .anyMatch(c -> c.trim().equalsIgnoreCase(companyName.trim()));
            if (isExcluded) {
                log.warn("Blocking email generation: Company '{}' is in the candidate's exclusion list.", companyName);
                throw new IllegalArgumentException("This company has been excluded in your profile settings.");
            }
        }
        
        String hook;
        if (callAi) {
            // Clear cache if 'Regenerate' is clicked to force fresh generation
            if (regenerate) {
                String cacheKey = "email_hook:" + userId + ":" + companyId + ":" + roleId;
                Cache cache = cacheManager.getCache("email_hooks");
                if (cache != null) {
                    cache.evict(cacheKey);
                    log.info("Evicted key '{}' from cache due to regeneration request.", cacheKey);
                }
            }
            String resumeSnippet = constructResumeSnippet(profile);
            String jobDescription = dto.getJobDetails().getDescription();
            // Select LLM Model based on routing rules
            String model = regenerate ? lowCostModel : highIntelModel;
            // Generate hook (utilizing cached self call to activate Spring cache proxy)
            hook = self.generateHook(userId, companyId, roleId, jobDescription, resumeSnippet, model);
        } else {
            log.info("Generating deterministic hook locally (No AI)");
            hook = generateDeterministicHook(profile, dto);
        }

        // 5. Retrieve Template if specified
        EmailTemplate emailTemplate = null;
        String templateIdToUse = dto.getTemplateId();
        if (templateIdToUse == null && profile.getTargetTemplateId() != null) {
            templateIdToUse = profile.getTargetTemplateId();
        }
        if (templateIdToUse != null) {
            emailTemplate = templateRepository.findById(templateIdToUse).orElse(null);
            if (emailTemplate != null) {
                log.info("Using email template from database: {}", emailTemplate.getName());
            } else {
                log.warn("Requested template ID '{}' not found. Falling back to default layout.", templateIdToUse);
            }
        }

        String recipientEmail = "recruiter@example.com";
        if (dto.getJobDetails().getHrEmails() != null && !dto.getJobDetails().getHrEmails().isEmpty()) {
            recipientEmail = dto.getJobDetails().getHrEmails().get(0);
        }

        // 6. Programmatically match skills and calculate experience
        String matchingSkills = getMatchingSkillsString(profile, dto);
        double experienceYears = calculateExperienceYears(profile);

        // 7. Populate context variables
        Map<String, Object> templateContext = new HashMap<>();
        templateContext.put("recruiterName", "Hiring Team");
        templateContext.put("hrName", "Hiring Team");
        templateContext.put("HOOK", hook);
        templateContext.put("valueProposition", hook);
        templateContext.put("EXPERIENCE_HIGHLIGHT", constructExperienceHighlight(profile));
        templateContext.put("CLOSING", constructClosing(profile));
        templateContext.put("jobRole", jobTitle);
        templateContext.put("jobTitle", jobTitle);
        templateContext.put("companyName", companyName);
        templateContext.put("company", companyName);
        templateContext.put("candidateName", profile.getName());
        templateContext.put("skills", matchingSkills);
        templateContext.put("experienceYears", String.valueOf(experienceYears));

        // 8. Render subject and structured segments (Intro, Skills, Body, Sign-off)
        String renderedSubject;
        String renderedBody;

        if (emailTemplate != null) {
            renderedSubject = templateEngine.render(emailTemplate.getSubject(), templateContext);
            
            // Render segments, falling back to default formats if segment columns are empty
            String introTemplate = (emailTemplate.getIntro() == null || emailTemplate.getIntro().trim().isEmpty())
                    ? "Dear {{recruiterName}}," : emailTemplate.getIntro();
            String skillsTemplate = (emailTemplate.getSkillsTemplate() == null || emailTemplate.getSkillsTemplate().trim().isEmpty())
                    ? "{{HOOK}}" : emailTemplate.getSkillsTemplate();
            String bodyTemplate = (emailTemplate.getBody() == null || emailTemplate.getBody().trim().isEmpty())
                    ? "{{EXPERIENCE_HIGHLIGHT}}" : emailTemplate.getBody();
            String signOffTemplate = (emailTemplate.getSignOff() == null || emailTemplate.getSignOff().trim().isEmpty())
                    ? "{{CLOSING}}" : emailTemplate.getSignOff();

            String renderedIntro = templateEngine.render(introTemplate, templateContext);
            String renderedSkills = templateEngine.render(skillsTemplate, templateContext);
            String renderedBodySeg = templateEngine.render(bodyTemplate, templateContext);
            String renderedSignOff = templateEngine.render(signOffTemplate, templateContext);

            renderedBody = renderedIntro + "\n\n" + renderedSkills + "\n\n" + renderedBodySeg + "\n\n" + renderedSignOff;
        } else {
            renderedSubject = String.format("Application for %s at %s", jobTitle, companyName);
            
            // Build body from standard boilerplate blocks
            String renderedIntro = templateEngine.render("Dear {{recruiterName}},", templateContext);
            String renderedSkills = templateEngine.render("{{HOOK}}", templateContext);
            String renderedBodySeg = templateEngine.render("{{EXPERIENCE_HIGHLIGHT}}", templateContext);
            String renderedSignOff = templateEngine.render("{{CLOSING}}", templateContext);
            
            renderedBody = renderedIntro + "\n\n" + renderedSkills + "\n\n" + renderedBodySeg + "\n\n" + renderedSignOff;
        }

        return EmailGenerationResponseDto.builder()
                .subject(renderedSubject)
                .body(renderedBody)
                .recipientEmail(recipientEmail)
                .build();
    }

    private String generateDeterministicHook(CandidateProfileDto profile, EmailGenerationRequestDto dto) {
        String jobTitle = dto.getJobDetails().getTitle();
        String companyName = dto.getJobDetails().getCompany();
        List<String> candidateSkills = profile.getSkills();
        List<String> jobSkills = dto.getJobDetails().getSkills();

        List<String> matchingSkills = new ArrayList<>();
        if (candidateSkills != null && jobSkills != null) {
            for (String cSkill : candidateSkills) {
                for (String jSkill : jobSkills) {
                    if (cSkill.trim().equalsIgnoreCase(jSkill.trim())) {
                        matchingSkills.add(cSkill.trim());
                    }
                }
            }
        }

        if (!matchingSkills.isEmpty()) {
            int limit = Math.min(3, matchingSkills.size());
            List<String> displaySkills = matchingSkills.subList(0, limit);
            return String.format("As a developer with hands-on experience in %s, I am writing to express my strong interest in the %s position at %s.",
                    String.join(", ", displaySkills), jobTitle, companyName);
        } else {
            return String.format("I am writing to express my interest in the %s position at %s, as my background and passion for building high-quality software align with your team's goals.",
                    jobTitle, companyName);
        }
    }

    @Override
    @Cacheable(value = "email_hooks", key = "'email_hook:' + #userId + ':' + #companyId + ':' + #roleId", unless = "#result == null")
    public String generateHook(Long userId, String companyId, String roleId, String jobDescription, String resumeSnippet, String model) {
        log.info("Cache miss: Calling AI model ({}) to generate hook for User ID: {}, Company ID: {}, Role ID: {}", 
                model, userId, companyId, roleId);
        
        try {
            // Resolve professional vertical for persona routing
            String persona = "DEVELOPER";
            try {
                CandidateProfileDto candidateProfile = userService.getCandidateProfile(userId);
                if (candidateProfile.getProfessionalVertical() != null) {
                    persona = candidateProfile.getProfessionalVertical();
                }
            } catch (Exception ex) {
                log.warn("Failed to retrieve candidate vertical for User ID: {}, falling back to DEVELOPER. Error: {}", userId, ex.getMessage());
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("job_description", jobDescription);
            payload.put("resume_snippet", resumeSnippet);
            payload.put("model", model);
            payload.put("persona", persona);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(llmServiceUrl, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("hook");
            } else {
                throw new RuntimeException("Python microservice hook generation failed.");
            }
        } catch (Exception e) {
            log.error("AI hook generation failed, falling back to basic generic hook", e);
            // Graceful fallback hook in case AI service or Redis is down
            return "I am writing to express my interest in joining your team, as my skills and experience align closely with the requirements of this role.";
        }
    }

    private String constructResumeSnippet(CandidateProfileDto profile) {
        StringBuilder snippet = new StringBuilder();
        snippet.append("Candidate: ").append(profile.getName()).append("\n");
        if (profile.getSummary() != null && !profile.getSummary().trim().isEmpty()) {
            snippet.append("Summary: ").append(profile.getSummary()).append("\n");
        }
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            snippet.append("Skills: ").append(String.join(", ", profile.getSkills())).append("\n");
        }
        if (profile.getExperience() != null && !profile.getExperience().isEmpty()) {
            snippet.append("Experience Snippet:\n");
            int limit = Math.min(2, profile.getExperience().size());
            for (int i = 0; i < limit; i++) {
                Map<String, Object> exp = profile.getExperience().get(i);
                snippet.append("- ").append(exp.getOrDefault("title", "Software Engineer"))
                        .append(" at ").append(exp.getOrDefault("company", "Company"))
                        .append(" (").append(exp.getOrDefault("duration", "N/A")).append("): ")
                        .append(exp.getOrDefault("description", "No details available.")).append("\n");
            }
        }
        return snippet.toString();
    }

    private String constructExperienceHighlight(CandidateProfileDto profile) {
        if (profile.getExperience() != null && !profile.getExperience().isEmpty()) {
            Map<String, Object> topExp = profile.getExperience().get(0);
            String title = (String) topExp.getOrDefault("title", "Software Engineer");
            String company = (String) topExp.getOrDefault("company", "leading organization");
            String skillsHighlight = profile.getSkills() != null && !profile.getSkills().isEmpty() 
                    ? String.join(", ", profile.getSkills().subList(0, Math.min(3, profile.getSkills().size()))) 
                    : "software engineering";
            
            return String.format("Throughout my career, notably during my time as a %s at %s, " +
                    "I have consistently delivered technical solutions and polished products using tools like %s.", 
                    title, company, skillsHighlight);
        }
        return "I have a proven record of designing, building, and maintaining reliable systems that meet user requirements and business objectives.";
    }

    private String constructClosing(CandidateProfileDto profile) {
        return String.format("Best regards,\n\n%s\n%s\n%s", 
                profile.getName(), 
                profile.getEmail(), 
                profile.getMobile() != null ? profile.getMobile() : "");
    }

    @Override
    public java.util.Map<String, Object> getLlmStats() {
        log.info("Requesting LLM telemetry statistics from AI pipeline service");
        try {
            String pythonStatsUrl = llmServiceUrl.replace("/generate-hook", "/llm-stats");
            ResponseEntity<java.util.Map> response = restTemplate.getForEntity(pythonStatsUrl, java.util.Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("AI pipeline telemetry endpoint returned status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Failed to fetch statistics from AI pipeline", e);
            throw new RuntimeException("Failed to fetch LLM statistics: " + e.getMessage(), e);
        }
    }

    private double calculateExperienceYears(CandidateProfileDto profile) {
        if (profile.getExperience() == null || profile.getExperience().isEmpty()) {
            return 0.0;
        }
        double totalYears = 0.0;
        for (Map<String, Object> exp : profile.getExperience()) {
            Object durationObj = exp.get("duration");
            if (durationObj != null) {
                String durationStr = String.valueOf(durationObj).toLowerCase();
                try {
                    if (durationStr.contains("year") || durationStr.contains("yr")) {
                        String numericPart = durationStr.replaceAll("[^0-9.]", "");
                        if (!numericPart.isEmpty()) {
                            totalYears += Double.parseDouble(numericPart);
                        }
                    } else if (durationStr.contains("month") || durationStr.contains("mo")) {
                        String numericPart = durationStr.replaceAll("[^0-9.]", "");
                        if (!numericPart.isEmpty()) {
                            totalYears += Double.parseDouble(numericPart) / 12.0;
                        }
                    } else {
                        String numericPart = durationStr.replaceAll("[^0-9.]", "");
                        if (!numericPart.isEmpty()) {
                            totalYears += Double.parseDouble(numericPart);
                        }
                    }
                } catch (NumberFormatException e) {
                    totalYears += 2.0;
                }
            } else {
                totalYears += 2.0;
            }
        }
        return totalYears;
    }

    private String getMatchingSkillsString(CandidateProfileDto profile, EmailGenerationRequestDto dto) {
        List<String> candidateSkills = profile.getSkills();
        List<String> jobSkills = dto.getJobDetails().getSkills();
        if (candidateSkills == null || jobSkills == null || candidateSkills.isEmpty() || jobSkills.isEmpty()) {
            return "";
        }
        List<String> matchingSkills = new ArrayList<>();
        for (String cSkill : candidateSkills) {
            for (String jSkill : jobSkills) {
                if (cSkill.trim().equalsIgnoreCase(jSkill.trim())) {
                    matchingSkills.add(cSkill.trim());
                }
            }
        }
        return String.join(", ", matchingSkills);
    }
}
