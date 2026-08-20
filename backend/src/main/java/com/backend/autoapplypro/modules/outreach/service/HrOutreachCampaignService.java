package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.hr.HrDetails;
import com.backend.autoapplypro.modules.hr.HrRepository;
import com.backend.autoapplypro.modules.jobs.model.JobPosting;
import com.backend.autoapplypro.modules.jobs.repository.JobPostingRepository;
import com.backend.autoapplypro.modules.jobs.service.ClientScraperServiceImpl;
import com.backend.autoapplypro.modules.billing.service.SubscriptionGatingService;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.testingemails.TestingEmail;
import com.backend.autoapplypro.testingemails.TestingEmailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HrOutreachCampaignService {

    private final UserRepository userRepository;
    private final EmailQueueRepository queueRepository;
    private final EmailTemplateRepository templateRepository;
    private final TestingEmailRepository testingEmailRepository;
    private final HrRepository hrRepository;
    private final JobPostingRepository jobPostingRepository;
    private final OutreachSchedulerService schedulerService;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final SubscriptionGatingService subscriptionGatingService;
    private final GmailEmailSender gmailEmailSender;

    @Transactional
    public void toggleCampaign(User user, boolean enable, String targetRole, String templateId, String sourceTable) {
        log.info("Toggling HR Outreach Campaign for user ID: {}. Enable: {}, Target Role: {}, Template ID: {}, Source Table: {}",
                user.getId(), enable, targetRole, templateId, sourceTable);

        // Always update user configuration fields
        user.setHrOutreachTargetRole(targetRole != null ? targetRole : "Software Engineer");
        user.setHrOutreachTemplateId(templateId != null ? templateId : "default-1");
        user.setHrOutreachSourceTable(sourceTable != null ? sourceTable : "SMART_MATCH");

        boolean oldStatus = Boolean.TRUE.equals(user.getHrOutreachCampaignEnabled());
        user.setHrOutreachCampaignEnabled(enable);
        userRepository.save(user);

        if (oldStatus && !enable) {
            deactivateCampaign(user);
        } else if (!oldStatus && enable) {
            activateCampaign(user);
        } else if (enable) {
            deactivateCampaign(user);
            activateCampaign(user);
        }
    }

    private void deactivateCampaign(User user) {
        log.info("Deactivating campaign for user ID: {}. Removing pending campaign emails from queue.", user.getId());
        List<EmailQueue> campaignEmails = queueRepository.findByUserId(user.getId()).stream()
                .filter(e -> Boolean.TRUE.equals(e.getIsCampaign()) && 
                        (e.getStatus() == OutreachStatus.PENDING || e.getStatus() == OutreachStatus.PAUSED))
                .toList();

        if (!campaignEmails.isEmpty()) {
            queueRepository.deleteAll(campaignEmails);
            log.info("Removed {} pending/paused campaign emails for user ID: {}", campaignEmails.size(), user.getId());
        }
    }

    private void activateCampaign(User user) {
        log.info("Activating campaign for user ID: {}. Queueing first campaign email.", user.getId());
        queueNextCampaignEmail(user);
    }

    @Transactional
    public void queueNextCampaignEmail(User user) {
        log.info("Attempting to queue next campaign email for user ID: {}", user.getId());
        
        String sourceTable = user.getHrOutreachSourceTable() != null ? user.getHrOutreachSourceTable() : "SMART_MATCH";
        String templateId = user.getHrOutreachTemplateId() != null ? user.getHrOutreachTemplateId() : "default-1";
        String targetRole = user.getHrOutreachTargetRole() != null ? user.getHrOutreachTargetRole() : "Software Engineer";

        // Fetch template
        EmailTemplate template = templateRepository.findById(templateId)
                .orElseGet(() -> {
                    log.warn("Template ID {} not found. Falling back to default-1.", templateId);
                    return templateRepository.findById("default-1")
                            .orElseGet(() -> EmailTemplate.builder()
                                    .id("default-1")
                                    .name("General Application Outreach")
                                    .subject("Application for {{jobRole}} | {{hrName}}")
                                    .body("Hi {{hrName}},<br/><br/>I hope you are doing well.<br/><br/>I am reaching out to express my interest in the <strong>{{jobRole}}</strong> position at <strong>{{companyName}}</strong>.<br/><br/>Best regards,<br/>" + user.getName())
                                    .build());
                });

        // 1. Gather processed email set for deduplication
        List<EmailQueue> userEmails = queueRepository.findByUserId(user.getId());
        Set<String> processedEmails = new HashSet<>();
        for (EmailQueue eq : userEmails) {
            if (eq.getRecipientEmail() != null) {
                processedEmails.add(eq.getRecipientEmail().toLowerCase().trim());
            }
        }

        List<String> excludedCompanies = professionalProfileRepository.findByUserId(user.getId())
                .map(ProfessionalProfile::getExcludedCompanies)
                .orElse(null);

        // 2. Multi-tier recipient selection strategy
        RecipientInfo recipient = selectRecipientByStrategy(sourceTable, targetRole, user.getId(), processedEmails, excludedCompanies);

        if (recipient == null) {
            log.warn("No eligible recipients found for user ID: {} across all strategies (Source Mode: {}). Campaign queue paused.", user.getId(), sourceTable);
            return;
        }

        // 3. Retrieve candidate profile defaults for placeholder substitution
        ProfessionalProfile candidateProfile = professionalProfileRepository.findByUserIdAndIsDefaultTrue(user.getId()).orElse(null);
        String defaultSkills = "Java, Spring Boot, React";
        String expYearsStr = "5";
        if (candidateProfile != null) {
            if (candidateProfile.getSkills() != null && !candidateProfile.getSkills().isEmpty()) {
                String joined = candidateProfile.getSkills().stream()
                        .map(com.backend.autoapplypro.modules.users.model.Skill::getName)
                        .filter(s -> s != null && !s.trim().isEmpty())
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("");
                if (!joined.trim().isEmpty()) {
                    defaultSkills = joined;
                }
            }
            if (candidateProfile.getExperience() != null && !candidateProfile.getExperience().isEmpty()) {
                expYearsStr = String.valueOf(candidateProfile.getExperience().size() * 2);
            }
        }

        String candidateName = user.getName() != null ? user.getName() : "Candidate";
        String candidateMobile = user.getMobile() != null ? user.getMobile() : "";
        String candidateEmail = user.getEmail() != null ? user.getEmail() : "";

        String introTpl = (template.getIntro() != null && !template.getIntro().trim().isEmpty())
                ? template.getIntro() : "Dear {{recruiterName}},";
        String skillsTpl = template.getSkillsTemplate() != null ? template.getSkillsTemplate() : "";
        String bodyTpl = template.getBody() != null ? template.getBody() : "";
        String signOffTpl = (template.getSignOff() != null && !template.getSignOff().trim().isEmpty())
                ? template.getSignOff() : "Regards,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}";

        String renderedSubject = substitutePlaceholders(template.getSubject(), recipient, targetRole, candidateName, candidateMobile, candidateEmail, defaultSkills, expYearsStr);
        String renderedIntro = substitutePlaceholders(introTpl, recipient, targetRole, candidateName, candidateMobile, candidateEmail, defaultSkills, expYearsStr);
        String renderedSkills = substitutePlaceholders(skillsTpl, recipient, targetRole, candidateName, candidateMobile, candidateEmail, defaultSkills, expYearsStr);
        String renderedBodySeg = substitutePlaceholders(bodyTpl, recipient, targetRole, candidateName, candidateMobile, candidateEmail, defaultSkills, expYearsStr);
        String renderedSignOff = substitutePlaceholders(signOffTpl, recipient, targetRole, candidateName, candidateMobile, candidateEmail, defaultSkills, expYearsStr);

        List<String> segments = new ArrayList<>();
        if (renderedIntro != null && !renderedIntro.trim().isEmpty()) {
            segments.add(renderedIntro.trim().replace("\n", "<br/>"));
        }
        if (renderedSkills != null && !renderedSkills.trim().isEmpty()) {
            segments.add(renderedSkills.trim().replace("\n", "<br/>"));
        }
        if (renderedBodySeg != null && !renderedBodySeg.trim().isEmpty()) {
            segments.add(renderedBodySeg.trim().replace("\n", "<br/>"));
        }
        if (renderedSignOff != null && !renderedSignOff.trim().isEmpty()) {
            segments.add(renderedSignOff.trim().replace("\n", "<br/>"));
        }

        String subject = renderedSubject;
        String body = String.join("<br/><br/>", segments);

        // Compute next schedule time
        LocalDateTime scheduledAt = schedulerService.calculateNextScheduleTime(user);

        String dispatchMode = user.getHrOutreachDispatchMode() != null ? user.getHrOutreachDispatchMode() : "DIRECT_SEND";
        OutreachStatus status = OutreachStatus.PENDING;

        if ("GMAIL_DRAFTS".equalsIgnoreCase(dispatchMode) || "DRAFTS".equalsIgnoreCase(dispatchMode)) {
            status = OutreachStatus.DRAFT;
            try {
                gmailEmailSender.createDraft(user.getId(), recipient.email, null, subject, body);
                log.info("Automatically created Gmail draft for campaign recipient: {}", recipient.email);
            } catch (Exception e) {
                log.warn("Automatic Gmail draft creation failed for user ID: {}. Storing as local draft queue item fallback.", user.getId(), e);
            }
        } else if ("GMAIL_COMPOSE".equalsIgnoreCase(dispatchMode) || "WEB_COMPOSE".equalsIgnoreCase(dispatchMode)) {
            status = OutreachStatus.DRAFT;
        }

        EmailQueue queueItem = EmailQueue.builder()
                .user(user)
                .recipientEmail(recipient.email)
                .subject(subject)
                .body(body)
                .status(status)
                .isCampaign(true)
                .scheduledAt(scheduledAt)
                .build();

        queueRepository.save(queueItem);
        log.info("Successfully queued campaign email ID: {} (Status: {}, Mode: {}, Strategy: {}) to: {} for user ID: {}", 
                queueItem.getId(), status, dispatchMode, sourceTable, recipient.email, user.getId());
    }

    private RecipientInfo selectRecipientByStrategy(String sourceTable, String targetRole, Long userId,
                                                    Set<String> processedEmails, List<String> excludedCompanies) {
        LocalDateTime cutoff20Days = LocalDateTime.now().minusDays(20);

        if ("TESTING".equalsIgnoreCase(sourceTable)) {
            return pickFromTestingList(processedEmails, excludedCompanies);
        } else if ("ACTIVE_JOBS".equalsIgnoreCase(sourceTable)) {
            RecipientInfo activeMatch = pickFromActiveJobPostings(targetRole, cutoff20Days, processedEmails, excludedCompanies);
            if (activeMatch != null) return activeMatch;
            return pickFromActiveJobPostings(null, cutoff20Days, processedEmails, excludedCompanies);
        } else if ("MAIN".equalsIgnoreCase(sourceTable)) {
            return pickFromHrDetails(processedEmails, excludedCompanies);
        } else {
            // SMART_MATCH Strategy (Default Multi-Tier Cascade)
            // Tier 1: Role-matched active job postings from the last 20 days
            RecipientInfo tier1Match = pickFromRoleMatchedActiveJobs(targetRole, cutoff20Days, processedEmails, excludedCompanies);
            if (tier1Match != null) {
                log.info("SMART_MATCH Tier 1: Matched active job posting for role '{}' -> Recipient: {}", targetRole, tier1Match.email);
                return tier1Match;
            }

            // Tier 2: Any uncontacted active job posting from the last 20 days
            RecipientInfo tier2Match = pickFromActiveJobPostings(null, cutoff20Days, processedEmails, excludedCompanies);
            if (tier2Match != null) {
                log.info("SMART_MATCH Tier 2: Matched general active job posting -> Recipient: {}", tier2Match.email);
                return tier2Match;
            }

            // Tier 3: Fall back to permanent recruiter database (hr_details)
            RecipientInfo tier3Match = pickFromHrDetails(processedEmails, excludedCompanies);
            if (tier3Match != null) {
                log.info("SMART_MATCH Tier 3 (Fallback): Selected contact from hr_details database -> Recipient: {}", tier3Match.email);
                return tier3Match;
            }

            return null;
        }
    }

    private RecipientInfo pickFromRoleMatchedActiveJobs(String targetRole, LocalDateTime cutoff,
                                                         Set<String> processedEmails, List<String> excludedCompanies) {
        if (targetRole == null || targetRole.isBlank()) {
            return null;
        }
        List<JobPosting> activeJobs = jobPostingRepository.findActiveByRoleAndHrEmail(targetRole.trim(), cutoff);
        List<RecipientInfo> eligible = extractEligibleActiveJobRecipients(activeJobs, processedEmails, excludedCompanies);
        if (!eligible.isEmpty()) {
            Collections.shuffle(eligible);
            return eligible.get(0);
        }
        return null;
    }

    private RecipientInfo pickFromActiveJobPostings(String targetRoleFilter, LocalDateTime cutoff,
                                                     Set<String> processedEmails, List<String> excludedCompanies) {
        List<JobPosting> activeJobs;
        if (targetRoleFilter != null && !targetRoleFilter.isBlank()) {
            activeJobs = jobPostingRepository.findActiveByRoleAndHrEmail(targetRoleFilter.trim(), cutoff);
        } else {
            activeJobs = jobPostingRepository.findActiveWithHrEmail(cutoff);
        }
        List<RecipientInfo> eligible = extractEligibleActiveJobRecipients(activeJobs, processedEmails, excludedCompanies);
        if (!eligible.isEmpty()) {
            Collections.shuffle(eligible);
            return eligible.get(0);
        }
        return null;
    }

    private List<RecipientInfo> extractEligibleActiveJobRecipients(List<JobPosting> activeJobs, Set<String> processedEmails, List<String> excludedCompanies) {
        List<RecipientInfo> eligible = new ArrayList<>();
        if (activeJobs == null) return eligible;
        for (JobPosting job : activeJobs) {
            String email = job.getHrEmail();
            if (email != null && !email.trim().isEmpty()) {
                String name = "Hiring Team";
                String company = job.getCompany() != null ? job.getCompany() : "Hiring Company";
                String specificRole = job.getTitle() != null ? job.getTitle() : null;
                RecipientInfo info = new RecipientInfo(name, email.trim(), company, specificRole);
                if (isEligible(info, processedEmails, excludedCompanies)) {
                    eligible.add(info);
                }
            }
        }
        return eligible;
    }

    private RecipientInfo pickFromHrDetails(Set<String> processedEmails, List<String> excludedCompanies) {
        List<HrDetails> hrList = hrRepository.findAll();
        List<RecipientInfo> eligible = new ArrayList<>();
        for (HrDetails hr : hrList) {
            if (hr.getEmail() != null && !hr.getEmail().trim().isEmpty()) {
                RecipientInfo info = new RecipientInfo(hr.getName(), hr.getEmail().trim(), hr.getCompanyName());
                if (isEligible(info, processedEmails, excludedCompanies)) {
                    eligible.add(info);
                }
            }
        }
        if (!eligible.isEmpty()) {
            Collections.shuffle(eligible);
            return eligible.get(0);
        }
        return null;
    }

    private RecipientInfo pickFromTestingList(Set<String> processedEmails, List<String> excludedCompanies) {
        List<TestingEmail> testList = testingEmailRepository.findAll();
        List<RecipientInfo> eligible = new ArrayList<>();
        for (TestingEmail t : testList) {
            if (t.getEmail() != null && !t.getEmail().trim().isEmpty()) {
                RecipientInfo info = new RecipientInfo(t.getName(), t.getEmail().trim(), t.getCompanyName());
                if (isEligible(info, processedEmails, excludedCompanies)) {
                    eligible.add(info);
                }
            }
        }
        if (!eligible.isEmpty()) {
            Collections.shuffle(eligible);
            return eligible.get(0);
        }
        return null;
    }

    private boolean isEligible(RecipientInfo r, Set<String> processedEmails, List<String> excludedCompanies) {
        if (r == null || r.email == null || r.email.trim().isEmpty()) return false;
        String cleanEmail = r.email.toLowerCase().trim();
        if (processedEmails.contains(cleanEmail)) return false;
        if (excludedCompanies != null && !excludedCompanies.isEmpty() && r.companyName != null) {
            if (excludedCompanies.stream().anyMatch(c -> c.trim().equalsIgnoreCase(r.companyName.trim()))) {
                return false;
            }
        }
        if (!cleanEmail.contains("@")) return false;
        String domain = cleanEmail.substring(cleanEmail.indexOf('@') + 1);
        if (domain.isBlank() || domain.endsWith(".invalid") || domain.endsWith(".local") || domain.equals("example.com")) {
            return false;
        }

        return ClientScraperServiceImpl.hasMxRecord(domain);
    }

    private String substitutePlaceholders(String text, RecipientInfo recipient, String targetRole,
                                       String candidateName, String candidateMobile, String candidateEmail,
                                       String skills, String experienceYears) {
        if (text == null) return "";
        String recruiterName = (recipient != null && recipient.name != null && !recipient.name.trim().isEmpty())
                ? recipient.name : "Hiring Team";
        String companyName = (recipient != null && recipient.companyName != null) ? recipient.companyName : "";
        String roleToUse = (recipient != null && recipient.specificRole != null && !recipient.specificRole.trim().isEmpty())
                ? recipient.specificRole : (targetRole != null ? targetRole : "");
        return text
                .replace("{{recruiterName}}", recruiterName)
                .replace("{{hrName}}", recruiterName)
                .replace("{{companyName}}", companyName)
                .replace("{{jobRole}}", roleToUse)
                .replace("{{skills}}", skills != null ? skills : "")
                .replace("{{experienceYears}}", experienceYears != null ? experienceYears : "")
                .replace("{{candidateName}}", candidateName != null ? candidateName : "")
                .replace("{{candidateMobile}}", candidateMobile != null ? candidateMobile : "")
                .replace("{{candidateEmail}}", candidateEmail != null ? candidateEmail : "");
    }

    @Transactional
    public void deleteContactFromLists(String email) {
        log.info("Permanently removing invalid email address from contact lists: {}", email);
        try {
            hrRepository.deleteByEmailIgnoreCase(email);
            testingEmailRepository.deleteByEmailIgnoreCase(email);
        } catch (Exception e) {
            log.error("Failed to delete contact with email: {} from lists", email, e);
        }
    }

    private static class RecipientInfo {
        String name;
        String email;
        String companyName;
        String specificRole;

        RecipientInfo(String name, String email, String companyName) {
            this(name, email, companyName, null);
        }

        RecipientInfo(String name, String email, String companyName, String specificRole) {
            this.name = name;
            this.email = email;
            this.companyName = companyName;
            this.specificRole = specificRole;
        }
    }
}
