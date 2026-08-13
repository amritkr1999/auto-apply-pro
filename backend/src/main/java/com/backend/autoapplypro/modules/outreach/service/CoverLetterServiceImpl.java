package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.config.EmailTemplateEngine;
import com.backend.autoapplypro.modules.outreach.dto.CoverLetterRequestDto;
import com.backend.autoapplypro.modules.outreach.dto.CoverLetterResponseDto;
import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import com.backend.autoapplypro.modules.users.dto.CandidateProfileDto;
import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import com.backend.autoapplypro.modules.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoverLetterServiceImpl implements CoverLetterService {

    private final UserService userService;
    private final ProfessionalProfileRepository profileRepository;
    private final EmailTemplateRepository templateRepository;
    private final EmailTemplateEngine templateEngine;
    private final CoverLetterPdfGenerator pdfGenerator;

    @Override
    public CoverLetterResponseDto generateCoverLetter(CoverLetterRequestDto dto) {
        Long userId = dto.getUserId();
        String requestedMode = dto.getMode() != null ? dto.getMode().toUpperCase() : "TEMPLATE";
        String deliveryType = dto.getDeliveryType() != null ? dto.getDeliveryType().toUpperCase() : "ATTACHMENT";

        log.info("Generating Cover Letter for User ID: {}, Mode: {}, Delivery: {}", userId, requestedMode, deliveryType);

        if ("NONE".equals(requestedMode)) {
            return CoverLetterResponseDto.builder()
                    .mode("NONE")
                    .deliveryType(deliveryType)
                    .content(null)
                    .pdfBytes(null)
                    .isAiAvailable(false)
                    .message("No cover letter requested.")
                    .build();
        }

        // Mode: UPLOADED (Uses user's uploaded cover letter file)
        if ("UPLOADED".equals(requestedMode)) {
            ProfessionalProfile profile = profileRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + userId));

            if (profile.getCoverLetterBytes() != null && profile.getCoverLetterBytes().length > 0) {
                return CoverLetterResponseDto.builder()
                        .mode("UPLOADED")
                        .deliveryType(deliveryType)
                        .filename(profile.getCoverLetterFilename() != null ? profile.getCoverLetterFilename() : "Cover_Letter.pdf")
                        .contentType(profile.getCoverLetterContentType() != null ? profile.getCoverLetterContentType() : "application/pdf")
                        .pdfBytes(profile.getCoverLetterBytes())
                        .content("[Uploaded Cover Letter Attachment]")
                        .isAiAvailable(false)
                        .message("Using candidate uploaded cover letter file.")
                        .build();
            } else {
                log.warn("Uploaded cover letter requested but none uploaded for User ID: {}. Falling back to TEMPLATE mode.", userId);
                requestedMode = "TEMPLATE";
            }
        }

        // Mode: AI_GENERATED (Currently marked as Coming Soon per deployment server constraints)
        boolean isAiMode = "AI_GENERATED".equals(requestedMode);
        String aiNoticeMessage = null;
        if (isAiMode) {
            aiNoticeMessage = "AI Cover Letter generation is coming soon! Falling back to deterministic template cover letter for now.";
            log.info("AI Cover Letter requested for User ID: {}. AI server is currently offline/disabled. Returning fallback template with notice.", userId);
            requestedMode = "TEMPLATE";
        }

        // Fetch candidate details
        CandidateProfileDto profile;
        if (dto.getProfileId() != null) {
            profile = userService.getCandidateProfileById(userId, dto.getProfileId());
        } else {
            profile = userService.getCandidateProfile(userId);
        }

        // Resolve cover letter template
        String templateIdToUse = dto.getTemplateId();
        if (templateIdToUse == null || templateIdToUse.trim().isEmpty()) {
            templateIdToUse = profile.getDefaultCoverLetterTemplateId();
        }
        if (templateIdToUse == null || templateIdToUse.trim().isEmpty()) {
            templateIdToUse = "cover-letter-default-1";
        }

        EmailTemplate template = templateRepository.findById(templateIdToUse).orElse(null);
        if (template == null) {
            template = templateRepository.findById("cover-letter-default-1").orElse(null);
        }

        // Context setup for Mustache rendering
        String companyName = (dto.getJobDetails() != null && dto.getJobDetails().getCompany() != null) ? dto.getJobDetails().getCompany() : "Hiring Company";
        String jobRole = (dto.getJobDetails() != null && dto.getJobDetails().getTitle() != null) ? dto.getJobDetails().getTitle() : "Software Engineer";

        Map<String, Object> context = new HashMap<>();
        context.put("candidateName", profile.getName() != null ? profile.getName() : "Candidate");
        context.put("candidateEmail", profile.getEmail() != null ? profile.getEmail() : "");
        context.put("candidateMobile", profile.getMobile() != null ? profile.getMobile() : "");
        context.put("companyName", companyName);
        context.put("jobRole", jobRole);
        context.put("recruiterName", "Hiring Team");
        context.put("hrName", "Hiring Team");
        context.put("experienceYears", String.valueOf(calculateExperienceYears(profile)));

        List<String> matchingSkills = getMatchingSkillsList(profile, dto);
        context.put("skills", String.join(", ", matchingSkills));

        String renderedContent;
        if (template != null) {
            String intro = template.getIntro() != null ? templateEngine.render(template.getIntro(), context) : "Dear Hiring Manager,";
            String skills = template.getSkillsTemplate() != null ? templateEngine.render(template.getSkillsTemplate(), context) : "";
            String body = template.getBody() != null ? templateEngine.render(template.getBody(), context) : "";
            String signOff = template.getSignOff() != null ? templateEngine.render(template.getSignOff(), context) : "Sincerely,\n" + profile.getName();

            renderedContent = intro + "\n\n" + skills + "\n\n" + body + "\n\n" + signOff;
        } else {
            renderedContent = String.format("Dear Hiring Manager,\n\nI am writing to apply for the %s position at %s. With my background in %s, I look forward to connecting.\n\nSincerely,\n%s",
                    jobRole, companyName, String.join(", ", matchingSkills), profile.getName());
        }

        byte[] pdfBytes = null;
        if ("ATTACHMENT".equals(deliveryType)) {
            String title = "Cover Letter - " + (profile.getName() != null ? profile.getName() : "Candidate");
            pdfBytes = pdfGenerator.generatePdf(title, renderedContent);
        }

        return CoverLetterResponseDto.builder()
                .mode(isAiMode ? "AI_GENERATED" : "TEMPLATE")
                .deliveryType(deliveryType)
                .content(renderedContent)
                .filename("Cover_Letter_" + (profile.getName() != null ? profile.getName().replace(" ", "_") : "Candidate") + ".pdf")
                .contentType("application/pdf")
                .pdfBytes(pdfBytes)
                .isAiAvailable(false) // Currently false as AI model server is offline
                .message(aiNoticeMessage != null ? aiNoticeMessage : "Cover letter generated successfully using template.")
                .build();
    }

    private double calculateExperienceYears(CandidateProfileDto profile) {
        if (profile.getExperience() == null || profile.getExperience().isEmpty()) {
            return 2.0;
        }
        return Math.max(1.0, profile.getExperience().size() * 1.5);
    }

    private List<String> getMatchingSkillsList(CandidateProfileDto profile, CoverLetterRequestDto dto) {
        List<String> candidateSkills = profile.getSkills();
        if (candidateSkills == null || candidateSkills.isEmpty()) {
            return List.of("software development", "problem solving");
        }
        if (dto.getJobDetails() == null || dto.getJobDetails().getSkills() == null || dto.getJobDetails().getSkills().isEmpty()) {
            return candidateSkills.subList(0, Math.min(4, candidateSkills.size()));
        }
        List<String> matching = new ArrayList<>();
        for (String cSkill : candidateSkills) {
            for (String jSkill : dto.getJobDetails().getSkills()) {
                if (cSkill.trim().equalsIgnoreCase(jSkill.trim())) {
                    matching.add(cSkill.trim());
                }
            }
        }
        if (matching.isEmpty()) {
            return candidateSkills.subList(0, Math.min(4, candidateSkills.size()));
        }
        return matching;
    }
}
