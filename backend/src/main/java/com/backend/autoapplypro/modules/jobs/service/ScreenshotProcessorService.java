package com.backend.autoapplypro.modules.jobs.service;

import com.backend.autoapplypro.modules.jobs.model.JobPosting;
import com.backend.autoapplypro.modules.jobs.model.ScreenshotUpload;
import com.backend.autoapplypro.modules.jobs.repository.JobPostingRepository;
import com.backend.autoapplypro.modules.jobs.repository.ScreenshotUploadRepository;
import com.backend.autoapplypro.modules.jobs.dto.JobDetailsDto;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.model.Skill;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import com.backend.autoapplypro.modules.users.repository.SkillRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.dto.CandidateProfileDto;
import com.backend.autoapplypro.modules.users.service.UserService;
import com.backend.autoapplypro.modules.outreach.dto.EmailGenerationResponseDto;
import com.backend.autoapplypro.modules.outreach.dto.EmailGenerationRequestDto;
import com.backend.autoapplypro.modules.outreach.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScreenshotProcessorService {

    private final ScreenshotUploadRepository screenshotRepository;
    private final JobPostingRepository jobPostingRepository;
    private final EmailQueueRepository emailQueueRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final SkillRepository skillRepository;
    private final UserService userService;
    private final EmailService emailService;
    private final RestTemplate restTemplate = new RestTemplate();

    @org.springframework.beans.factory.annotation.Value("${pipeline.service.url:http://localhost:8000}")
    private String pythonServiceUrl;

    @Async
    @Transactional
    public void processScreenshotAsync(Long uploadId) {
        log.info("Starting async screenshot processing for upload ID: {}", uploadId);
        Optional<ScreenshotUpload> uploadOpt = screenshotRepository.findById(uploadId);
        if (uploadOpt.isEmpty()) {
            log.error("Screenshot upload record not found for ID: {}", uploadId);
            return;
        }

        ScreenshotUpload upload = uploadOpt.get();
        try {
            // 1. Update Status: PARSING
            upload.setStatus("PARSING");
            screenshotRepository.save(upload);

            // Forward to Python OCR extraction service
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ByteArrayResource fileResource = new ByteArrayResource(upload.getFileBytes()) {
                @Override
                public String getFilename() {
                    return upload.getFileName() != null ? upload.getFileName() : "screenshot.png";
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<JobDetailsDto> parseResponse = restTemplate.postForEntity(
                    pythonServiceUrl + "/extract-job-details",
                    requestEntity,
                    JobDetailsDto.class
            );

            JobDetailsDto jobDetails = parseResponse.getBody();
            if (jobDetails == null) {
                throw new RuntimeException("Python OCR service returned empty job details.");
            }

            // 2. Save the Job Posting to the Database and associate skills
            Set<Skill> jobSkills = new HashSet<>();
            if (jobDetails.getSkills() != null) {
                for (String sName : jobDetails.getSkills()) {
                    String trimmed = sName.trim();
                    if (!trimmed.isEmpty()) {
                        Skill skill = skillRepository.findByNameIgnoreCase(trimmed)
                                .orElseGet(() -> skillRepository.save(Skill.builder().name(trimmed).build()));
                        jobSkills.add(skill);
                    }
                }
            }

            List<String> emails = new ArrayList<>();
            if (jobDetails.getHrEmails() != null) {
                for (String email : jobDetails.getHrEmails()) {
                    if (email != null && !email.trim().isEmpty() && !emails.contains(email.trim())) {
                        emails.add(email.trim());
                    }
                }
            }
            
            // Fallback to regex in description if list is empty
            if (emails.isEmpty() && jobDetails.getDescription() != null) {
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}");
                java.util.regex.Matcher matcher = pattern.matcher(jobDetails.getDescription());
                while (matcher.find()) {
                    String match = matcher.group();
                    if (!emails.contains(match)) {
                        emails.add(match);
                    }
                }
            }
            if (emails.isEmpty()) {
                emails.add("recruiter@example.com");
            }

            String primaryEmail = emails.get(0);
            String commaSeparatedEmails = String.join(",", emails);
            String draftCc = "";
            if (emails.size() > 1) {
                draftCc = String.join(",", emails.subList(1, emails.size()));
            }

            JobPosting jobPosting = JobPosting.builder()
                    .title(jobDetails.getTitle() != null ? jobDetails.getTitle() : "Software Engineer")
                    .company(jobDetails.getCompany() != null ? jobDetails.getCompany() : "Unknown Company")
                    .location(jobDetails.getLocation())
                    .description(jobDetails.getDescription())
                    .requirements(jobDetails.getRequirements())
                    .salary(jobDetails.getSalary())
                    .sourceUrl(jobDetails.getSourceUrl())
                    .hrEmail(primaryEmail)
                    .hrEmails(commaSeparatedEmails)
                    .skills(jobSkills)
                    .build();

            jobPosting = jobPostingRepository.save(jobPosting);
            log.info("Saved parsed JobPosting ID: {} ({} at {})", jobPosting.getId(), jobPosting.getTitle(), jobPosting.getCompany());

            // 3. Update Status: GENERATING (Generating for uploader)
            upload.setStatus("GENERATING");
            screenshotRepository.save(upload);

            // Fetch Candidate Profile of the uploader
            CandidateProfileDto profile = userService.getCandidateProfile(upload.getUser().getId());
            ProfessionalProfile uploaderProfile = professionalProfileRepository.findByUserIdAndIsDefaultTrue(upload.getUser().getId()).orElse(null);

            // Generate email for uploader
            EmailGenerationResponseDto emailData = generateEmailForCandidate(jobPosting, profile);
            if (emailData != null) {
                EmailQueue queueItem = EmailQueue.builder()
                        .user(upload.getUser())
                        .professionalProfile(uploaderProfile)
                        .jobPosting(jobPosting)
                        .recipientEmail(emailData.getRecipientEmail() != null ? emailData.getRecipientEmail() : primaryEmail)
                        .ccEmails(draftCc)
                        .parsedEmails(commaSeparatedEmails)
                        .subject(emailData.getSubject())
                        .body(emailData.getBody())
                        .status(OutreachStatus.DRAFT)
                        .scheduledAt(null)
                        .build();

                emailQueueRepository.save(queueItem);
                log.info("Saved outreach draft for uploader candidate ID: {}", upload.getUser().getId());
            }

            // 4. Match Other Candidates in the system by skillset
            List<ProfessionalProfile> allCandidates = professionalProfileRepository.findAll();
            log.info("Checking skill matching for {} system candidates...", allCandidates.size());
            
            for (ProfessionalProfile candidate : allCandidates) {
                // Skip the uploader
                if (candidate.getUser().getId().equals(upload.getUser().getId())) {
                    continue;
                }

                // Check if candidate shares any required skill
                boolean skillMatched = false;
                for (Skill requiredSkill : jobPosting.getSkills()) {
                    if (candidate.getSkills().contains(requiredSkill)) {
                        skillMatched = true;
                        break;
                    }
                }

                if (skillMatched) {
                    log.info("Skillset MATCH found for candidate ID: {} on job ID: {}", candidate.getUser().getId(), jobPosting.getId());
                    try {
                        CandidateProfileDto cProfile = userService.getCandidateProfile(candidate.getUser().getId());
                        EmailGenerationResponseDto matchedEmailData = generateEmailForCandidate(jobPosting, cProfile);
                        
                        if (matchedEmailData != null) {
                            EmailQueue matchedQueueItem = EmailQueue.builder()
                                    .user(candidate.getUser())
                                    .professionalProfile(candidate)
                                    .jobPosting(jobPosting)
                                    .recipientEmail(matchedEmailData.getRecipientEmail() != null ? matchedEmailData.getRecipientEmail() : primaryEmail)
                                    .ccEmails(draftCc)
                                    .parsedEmails(commaSeparatedEmails)
                                    .subject(matchedEmailData.getSubject())
                                    .body(matchedEmailData.getBody())
                                    .status(OutreachStatus.SUGGESTION)
                                    .scheduledAt(null)
                                    .build();

                            emailQueueRepository.save(matchedQueueItem);
                            log.info("Automatically generated and saved matched draft for user ID: {}", candidate.getUser().getId());
                        }
                    } catch (Exception matchErr) {
                        log.error("Failed to generate matched draft for candidate user ID: {}", candidate.getUser().getId(), matchErr);
                    }
                }
            }

            // 5. Update Status: COMPLETED, and delete the heavy image binary payload to keep database clean
            upload.setStatus("COMPLETED");
            upload.setFileBytes(null); // Fully delete the image bytes
            screenshotRepository.save(upload);
            log.info("Screenshot processing fully completed for ID: {}", uploadId);

        } catch (Exception e) {
            log.error("Failed to process screenshot upload ID: {}", uploadId, e);
            upload.setStatus("FAILED");
            upload.setErrorMessage(e.getMessage() != null ? e.getMessage() : "Unknown processing error occurred.");
            upload.setFileBytes(null); // Delete the image bytes even on failure to avoid bloating the database
            screenshotRepository.save(upload);
        }
    }

    private EmailGenerationResponseDto generateEmailForCandidate(JobPosting job, CandidateProfileDto profile) {
        try {
            java.util.List<String> skills = java.util.Collections.emptyList();
            if (job.getSkills() != null) {
                skills = job.getSkills().stream()
                        .map(com.backend.autoapplypro.modules.users.model.Skill::getName)
                        .toList();
            }

            java.util.List<String> hrEmails = java.util.Collections.emptyList();
            if (job.getHrEmails() != null && !job.getHrEmails().trim().isEmpty()) {
                hrEmails = java.util.Arrays.asList(job.getHrEmails().split(","));
            }

            JobDetailsDto jobDetailsDto = JobDetailsDto.builder()
                    .title(job.getTitle())
                    .company(job.getCompany())
                    .location(job.getLocation())
                    .description(job.getDescription())
                    .requirements(job.getRequirements())
                    .salary(job.getSalary())
                    .sourceUrl(job.getSourceUrl())
                    .skills(skills)
                    .hrEmails(hrEmails)
                    .build();

            EmailGenerationRequestDto requestDto = EmailGenerationRequestDto.builder()
                    .userId(profile.getUserId())
                    .jobDetails(jobDetailsDto)
                    .useAi(false)
                    .build();

            return emailService.generateEmail(requestDto, false);
        } catch (Exception e) {
            log.error("Error generating local outreach email for candidate", e);
            return null;
        }
    }
}
