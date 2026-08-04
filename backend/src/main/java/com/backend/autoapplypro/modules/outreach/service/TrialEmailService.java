package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.outreach.dto.TrialEmailRequestDto;
import com.backend.autoapplypro.modules.outreach.dto.TrialEmailResponseDto;
import com.backend.autoapplypro.modules.outreach.exception.OutreachSendException;
import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import com.backend.autoapplypro.modules.outreach.repository.GmailCredentialRepository;
import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrialEmailService {

    private final UserRepository userRepository;
    private final EmailTemplateRepository templateRepository;
    private final ProfessionalProfileRepository profileRepository;
    private final GmailCredentialRepository gmailCredentialRepository;
    private final EmailSender emailSender;

    public TrialEmailResponseDto sendTrialEmail(Long userId, TrialEmailRequestDto request) {
        log.info("Processing trial email request for User ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Check if user has connected Gmail credentials
        boolean hasGmailConnected = gmailCredentialRepository.findByUserId(userId).isPresent();
        if (!hasGmailConnected) {
            log.warn("Trial email failed for user ID {}: Gmail account not connected", userId);
            return TrialEmailResponseDto.builder()
                    .success(false)
                    .message("Gmail account not connected. Please connect your Gmail account in Outreach Settings to send trial emails.")
                    .sentAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                    .build();
        }

        // Determine target recipient email
        String recipientEmail = request.getTargetEmail();
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            recipientEmail = user.getEmail();
        }
        recipientEmail = recipientEmail.trim();

        // Resolve template content
        String rawSubject = request.getSubject();
        String rawIntro = request.getIntro();
        String rawSkills = request.getSkillsTemplate();
        String rawBody = request.getBody();
        String rawSignOff = request.getSignOff();

        if (request.getTemplateId() != null && !request.getTemplateId().trim().isEmpty()) {
            EmailTemplate dbTemplate = templateRepository.findById(request.getTemplateId()).orElse(null);
            if (dbTemplate != null) {
                if (rawSubject == null || rawSubject.trim().isEmpty()) rawSubject = dbTemplate.getSubject();
                if (rawIntro == null || rawIntro.trim().isEmpty()) rawIntro = dbTemplate.getIntro();
                if (rawSkills == null || rawSkills.trim().isEmpty()) rawSkills = dbTemplate.getSkillsTemplate();
                if (rawBody == null || rawBody.trim().isEmpty()) rawBody = dbTemplate.getBody();
                if (rawSignOff == null || rawSignOff.trim().isEmpty()) rawSignOff = dbTemplate.getSignOff();
            }
        }

        if (rawSubject == null || rawSubject.trim().isEmpty()) {
            rawSubject = "Application for {{jobRole}} | {{companyName}}";
        }
        if (rawBody == null || rawBody.trim().isEmpty()) {
            rawBody = "Hi {{hrName}},\n\nI am reaching out regarding the {{jobRole}} position at {{companyName}}.";
        }

        // Assemble full body from sections if separate sections are present
        StringBuilder fullBodyBuilder = new StringBuilder();
        if (rawIntro != null && !rawIntro.trim().isEmpty()) {
            fullBodyBuilder.append(rawIntro.trim()).append("\n\n");
        }
        if (rawSkills != null && !rawSkills.trim().isEmpty()) {
            fullBodyBuilder.append(rawSkills.trim()).append("\n\n");
        }
        fullBodyBuilder.append(rawBody.trim());
        if (rawSignOff != null && !rawSignOff.trim().isEmpty()) {
            fullBodyBuilder.append("\n\n").append(rawSignOff.trim());
        }
        String combinedBodyText = fullBodyBuilder.toString();

        // Retrieve user profile defaults
        ProfessionalProfile profile = profileRepository.findByUserIdAndIsDefaultTrue(userId).orElse(null);

        // Gather sample variable values (from request.sampleData or defaults)
        Map<String, String> sampleData = request.getSampleData() != null ? request.getSampleData() : Map.of();
        
        String defaultSkills = "Java, Spring Boot, React";
        if (profile != null && profile.getSkills() != null && !profile.getSkills().isEmpty()) {
            String joined = profile.getSkills().stream()
                    .map(com.backend.autoapplypro.modules.users.model.Skill::getName)
                    .filter(s -> s != null && !s.trim().isEmpty())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");
            if (!joined.trim().isEmpty()) {
                defaultSkills = joined;
            }
        }

        String recruiterName = getSampleValue(sampleData, "recruiterName", getSampleValue(sampleData, "hrName", "Hiring Team"));
        String companyName = getSampleValue(sampleData, "companyName", "Acme Corp");
        String jobRole = getSampleValue(sampleData, "jobRole", user.getHrOutreachTargetRole() != null ? user.getHrOutreachTargetRole() : "Software Engineer");
        String skills = getSampleValue(sampleData, "skills", defaultSkills);
        String experienceYears = getSampleValue(sampleData, "experienceYears", "5");
        
        String candidateName = user.getName() != null ? user.getName() : "Candidate";
        String candidateMobile = user.getMobile() != null ? user.getMobile() : "+1 (555) 0199";
        String candidateEmail = user.getEmail() != null ? user.getEmail() : recipientEmail;

        // Render placeholders
        String renderedSubject = renderPlaceholders(rawSubject, recruiterName, companyName, jobRole, skills, experienceYears, candidateName, candidateMobile, candidateEmail);
        String renderedBody = renderPlaceholders(combinedBodyText, recruiterName, companyName, jobRole, skills, experienceYears, candidateName, candidateMobile, candidateEmail);

        // Prefix subject line with [TRIAL EMAIL] banner
        String trialSubject = "[TRIAL EMAIL] " + renderedSubject;

        // Wrap body in trial banner
        String trialBody = "--------------------------------------------------------\n" +
                "  TRIAL EMAIL DISPATCH - VERIFICATION RUN\n" +
                "  This email was sent to verify your automated template.\n" +
                "--------------------------------------------------------\n\n" +
                renderedBody + "\n\n" +
                "--------------------------------------------------------\n" +
                "Sent via AutoApplyPro Trial Email Verification Tool.\n" +
                "--------------------------------------------------------";

        try {
            emailSender.sendEmail(userId, recipientEmail, trialSubject, trialBody);
            log.info("Successfully sent trial email to: {} for user ID: {}", recipientEmail, userId);
            
            return TrialEmailResponseDto.builder()
                    .success(true)
                    .message("Trial email successfully sent to " + recipientEmail + ". Check your inbox!")
                    .recipientEmail(recipientEmail)
                    .renderedSubject(trialSubject)
                    .sentAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                    .build();
        } catch (OutreachSendException e) {
            log.error("Outreach send error during trial email dispatch for user ID: {}", userId, e);
            return TrialEmailResponseDto.builder()
                    .success(false)
                    .message("Failed to send trial email: " + e.getMessage())
                    .recipientEmail(recipientEmail)
                    .sentAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error sending trial email for user ID: {}", userId, e);
            return TrialEmailResponseDto.builder()
                    .success(false)
                    .message("Error sending trial email: " + e.getMessage())
                    .recipientEmail(recipientEmail)
                    .sentAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                    .build();
        }
    }

    private String getSampleValue(Map<String, String> map, String key, String defaultValue) {
        if (map != null && map.containsKey(key) && map.get(key) != null && !map.get(key).trim().isEmpty()) {
            return map.get(key).trim();
        }
        return defaultValue;
    }

    private String renderPlaceholders(String text, String recruiterName, String companyName, String jobRole,
                                       String skills, String experienceYears, String candidateName,
                                       String candidateMobile, String candidateEmail) {
        if (text == null) return "";
        return text
                .replace("{{recruiterName}}", recruiterName)
                .replace("{{hrName}}", recruiterName)
                .replace("{{companyName}}", companyName)
                .replace("{{jobRole}}", jobRole)
                .replace("{{skills}}", skills)
                .replace("{{experienceYears}}", experienceYears)
                .replace("{{candidateName}}", candidateName)
                .replace("{{candidateMobile}}", candidateMobile)
                .replace("{{candidateEmail}}", candidateEmail);
    }
}
