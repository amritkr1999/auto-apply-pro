package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.model.*;
import com.backend.autoapplypro.modules.users.repository.*;
import com.backend.autoapplypro.modules.outreach.model.*;
import com.backend.autoapplypro.modules.outreach.repository.*;
import com.backend.autoapplypro.modules.jobs.model.*;
import com.backend.autoapplypro.modules.jobs.repository.*;
import com.backend.autoapplypro.modules.referrals.model.*;
import com.backend.autoapplypro.modules.referrals.repository.*;
import com.backend.autoapplypro.modules.learning.model.*;
import com.backend.autoapplypro.modules.learning.repository.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserDeletionScheduler {

    private final UserRepository userRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final RecruiterRepository recruiterRepository;
    private final CompanyRepository companyRepository;
    private final GmailCredentialRepository gmailCredentialRepository;
    private final EmailQueueRepository emailQueueRepository;
    private final ScreenshotUploadRepository screenshotUploadRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ReferralRequestRepository referralRequestRepository;
    private final ReferralOutreachRepository referralOutreachRepository;
    private final UserLearningProgressRepository userLearningProgressRepository;
    private final UserActivityLogRepository userActivityLogRepository;
    private final TransactionTemplate transactionTemplate;

    // Run every hour to check for expired accounts scheduled for deletion
    @Scheduled(cron = "0 0 * * * ?")
    public void executeAccountDeletions() {
        LocalDateTime now = LocalDateTime.now();
        List<User> usersToDelete = userRepository.findByStatusAndDeletionScheduledAtBefore(UserStatus.PENDING_DELETION, now);

        if (usersToDelete.isEmpty()) {
            return;
        }

        log.info("Found {} accounts pending permanent deletion. Starting deletion process...", usersToDelete.size());

        for (User user : usersToDelete) {
            try {
                transactionTemplate.executeWithoutResult(status -> {
                    purgeUserData(user);
                });
            } catch (Exception e) {
                log.error("Failed to permanently delete user ID: {} / Email: {}", user.getId(), user.getEmail(), e);
            }
        }

        log.info("Finished account deletion cron run.");
    }

    @Transactional
    public void purgeUserData(User user) {
        Long userId = user.getId();
        log.info("Permanently purging all personal data for user ID: {}", userId);

        // 1. Delete Referral Outreaches where user is recipient
        List<ReferralOutreach> receivedOutreaches = referralOutreachRepository.findByRecipientId(userId);
        if (!receivedOutreaches.isEmpty()) {
            referralOutreachRepository.deleteAll(receivedOutreaches);
            log.info("Deleted {} received referral outreaches", receivedOutreaches.size());
        }

        // 2. Delete Referral Requests (and their outreaches) created by user
        List<ReferralRequest> referralRequests = referralRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (ReferralRequest req : referralRequests) {
            List<ReferralOutreach> requestOutreaches = referralOutreachRepository.findByReferralRequestId(req.getId());
            if (!requestOutreaches.isEmpty()) {
                referralOutreachRepository.deleteAll(requestOutreaches);
            }
            referralRequestRepository.delete(req);
        }
        if (!referralRequests.isEmpty()) {
            log.info("Deleted {} referral requests and their outreaches", referralRequests.size());
        }

        // 3. Delete Gmail Credentials (OAuth tokens)
        Optional<GmailCredential> credentialOpt = gmailCredentialRepository.findByUserId(userId);
        if (credentialOpt.isPresent()) {
            gmailCredentialRepository.delete(credentialOpt.get());
            log.info("Deleted Gmail OAuth credentials");
        }

        // 4. Delete Email drafts/queue items
        List<EmailQueue> queuedEmails = emailQueueRepository.findByUserId(userId);
        if (!queuedEmails.isEmpty()) {
            emailQueueRepository.deleteAll(queuedEmails);
            log.info("Deleted {} queued/draft emails", queuedEmails.size());
        }

        // 5. Delete Screenshots
        List<ScreenshotUpload> screenshots = screenshotUploadRepository.findByUserId(userId);
        if (!screenshots.isEmpty()) {
            screenshotUploadRepository.deleteAll(screenshots);
            log.info("Deleted {} screenshot uploads", screenshots.size());
        }

        // 6. Delete Job Applications
        List<JobApplication> applications = jobApplicationRepository.findByUserId(userId);
        if (!applications.isEmpty()) {
            jobApplicationRepository.deleteAll(applications);
            log.info("Deleted {} job applications from tracker", applications.size());
        }

        // 7. Delete User Learning Progress
        Optional<UserLearningProgress> progressOpt = userLearningProgressRepository.findByUserId(userId);
        if (progressOpt.isPresent()) {
            userLearningProgressRepository.delete(progressOpt.get());
            log.info("Deleted user learning progress record");
        }

        // 8. Delete User Activity Logs
        List<UserActivityLog> activityLogs = userActivityLogRepository.findByUserId(userId);
        if (!activityLogs.isEmpty()) {
            userActivityLogRepository.deleteAll(activityLogs);
            log.info("Deleted {} user activity logs", activityLogs.size());
        }

        // 9. Delete Professional Profile
        if (user.getProfessionalProfile() != null) {
            professionalProfileRepository.delete(user.getProfessionalProfile());
            user.setProfessionalProfile(null);
            log.info("Deleted professional profile and resume");
        }

        // 10. Delete Recruiter profile
        if (user.getRecruiter() != null) {
            recruiterRepository.delete(user.getRecruiter());
            user.setRecruiter(null);
            log.info("Deleted recruiter profile");
        }

        // 11. Delete Company profile
        if (user.getCompany() != null) {
            companyRepository.delete(user.getCompany());
            user.setCompany(null);
            log.info("Deleted company profile");
        }

        // 12. Permanent Anonymization of Core User Row (Financial audit compliant)
        String anonymizedEmail = "deleted_" + userId + "_" + UUID.randomUUID().toString().substring(0, 8) + "@autoapplypro.deleted";
        user.setEmail(anonymizedEmail);
        user.setName("Deleted User");
        user.setMobile("");
        user.setOfficialEmail(null);
        user.setPasswordHash("DELETED_" + UUID.randomUUID().toString());
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setUnsubscribeToken(null);
        user.setStatus(UserStatus.DELETED);
        user.setDeletionScheduledAt(null);
        user.setDailyLimit(0);
        user.setSentToday(0);
        user.setLoginStreak(0);
        user.setLastLoginDate(null);
        user.setHrOutreachCampaignEnabled(false);

        userRepository.save(user);
        log.info("Permanently anonymized user row for ID: {}. Account deletion completed.", userId);
    }
}
