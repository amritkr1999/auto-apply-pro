package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.jobs.model.JobApplication;
import com.backend.autoapplypro.modules.jobs.repository.JobApplicationRepository;
import com.backend.autoapplypro.modules.outreach.dto.DailyDigestDto;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.service.SystemEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DailyDigestServiceImpl implements DailyDigestService {

    private final EmailQueueRepository emailQueueRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final SystemEmailService systemEmailService;

    @Value("${app.frontend.url:https://easynaukri.online}")
    private String baseUrl;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    @Override
    @Transactional(readOnly = true)
    public DailyDigestDto generateDailyDigest(User user, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // Fetch emails sent/failed today
        List<EmailQueue> sentEmailsToday = emailQueueRepository.findByUserIdAndSentAtBetween(user.getId(), startOfDay, endOfDay);
        
        // Fetch all pending drafts (left for review)
        List<EmailQueue> pendingDrafts = emailQueueRepository.findByUserIdAndStatus(user.getId(), OutreachStatus.PENDING);

        // Fetch job applications logged today
        List<JobApplication> appsToday = jobApplicationRepository.findByUserIdAndCreatedAtBetween(user.getId(), startOfDay, endOfDay);

        int sentCount = 0;
        int failedCount = 0;
        Map<String, Integer> modeBreakdown = new HashMap<>();

        List<DailyDigestDto.RecipientDetailDto> recipientDetails = new ArrayList<>();
        for (EmailQueue email : sentEmailsToday) {
            if (email.getStatus() == OutreachStatus.SENT) {
                sentCount++;
            } else if (email.getStatus() == OutreachStatus.FAILED) {
                failedCount++;
            }

            String mode = determineOutreachMode(email);
            modeBreakdown.put(mode, modeBreakdown.getOrDefault(mode, 0) + 1);

            String company = email.getJobPosting() != null && email.getJobPosting().getCompany() != null 
                    ? email.getJobPosting().getCompany() : "Direct Outreach";
            String jobTitle = email.getJobPosting() != null ? email.getJobPosting().getTitle() : "N/A";
            String timeFormatted = email.getSentAt() != null ? email.getSentAt().format(TIME_FORMATTER) : "N/A";

            recipientDetails.add(DailyDigestDto.RecipientDetailDto.builder()
                    .recipientEmail(email.getRecipientEmail())
                    .company(company)
                    .jobTitle(jobTitle)
                    .subject(email.getSubject())
                    .outreachMode(mode)
                    .status(email.getStatus() != null ? email.getStatus().name() : "SENT")
                    .sentTimeFormatted(timeFormatted)
                    .errorMessage(email.getErrorMessage())
                    .build());
        }

        List<DailyDigestDto.PendingDraftDto> draftDtos = pendingDrafts.stream()
                .limit(15) // Limit preview to top 15
                .map(d -> DailyDigestDto.PendingDraftDto.builder()
                        .draftId(d.getId())
                        .recipientEmail(d.getRecipientEmail())
                        .company(d.getJobPosting() != null && d.getJobPosting().getCompany() != null 
                                ? d.getJobPosting().getCompany() : "Outreach Draft")
                        .jobTitle(d.getJobPosting() != null ? d.getJobPosting().getTitle() : "Candidate Outreach")
                        .subject(d.getSubject())
                        .createdAtFormatted(d.getCreatedAt() != null ? d.getCreatedAt().format(TIME_FORMATTER) : "N/A")
                        .build())
                .collect(Collectors.toList());

        int sentTodayQuota = user.getSentToday() != null ? user.getSentToday() : 0;
        int dailyLimitQuota = user.getDailyLimit() != null ? user.getDailyLimit() : 50;
        int remainingQuota = Math.max(0, dailyLimitQuota - sentTodayQuota);

        String feedbackUrl = baseUrl + "/feedback?ref=eod_digest&date=" + date.toString();

        return DailyDigestDto.builder()
                .digestDate(date)
                .userName(user.getName())
                .userEmail(user.getEmail())
                .totalEmailsSentToday(sentCount)
                .totalEmailsFailedToday(failedCount)
                .pendingDraftsCount(pendingDrafts.size())
                .applicationsLoggedCount(appsToday.size())
                .sentTodayQuota(sentTodayQuota)
                .dailyLimitQuota(dailyLimitQuota)
                .remainingQuota(remainingQuota)
                .sentByModeBreakdown(modeBreakdown)
                .recipients(recipientDetails)
                .pendingDrafts(draftDtos)
                .feedbackLink(feedbackUrl)
                .build();
    }

    private String determineOutreachMode(EmailQueue email) {
        if (Boolean.TRUE.equals(email.getIsCampaign())) {
            return "Automated HR Campaign";
        }
        if (email.getSubject() != null && email.getSubject().toLowerCase().contains("plaque")) {
            return "Plaque Card Inquiry";
        }
        return "Cold Email Outreach";
    }

    @Override
    public String buildDailyDigestHtml(DailyDigestDto digest) {
        StringBuilder recipientRows = new StringBuilder();
        if (digest.getRecipients() == null || digest.getRecipients().isEmpty()) {
            recipientRows.append("<tr><td colspan='5' style='text-align: center; color: #6b7280; padding: 16px;'>No emails dispatched today.</td></tr>");
        } else {
            for (DailyDigestDto.RecipientDetailDto r : digest.getRecipients()) {
                String statusBadgeColor = "SENT".equalsIgnoreCase(r.getStatus()) ? "#10b981" : "#ef4444";
                recipientRows.append(String.format("""
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 10px 12px; font-weight: 500; color: #1f2937;">%s</td>
                        <td style="padding: 10px 12px; color: #4b5563;">%s</td>
                        <td style="padding: 10px 12px; color: #4b5563; font-size: 13px;">%s</td>
                        <td style="padding: 10px 12px;"><span style="background: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">%s</span></td>
                        <td style="padding: 10px 12px; text-align: right;"><span style="color: %s; font-weight: 600; font-size: 12px;">%s</span></td>
                    </tr>
                    """,
                        escapeHtml(r.getRecipientEmail()),
                        escapeHtml(r.getCompany()),
                        escapeHtml(r.getSubject()),
                        escapeHtml(r.getOutreachMode()),
                        statusBadgeColor,
                        escapeHtml(r.getStatus())
                ));
            }
        }

        StringBuilder pendingRows = new StringBuilder();
        if (digest.getPendingDrafts() != null && !digest.getPendingDrafts().isEmpty()) {
            for (DailyDigestDto.PendingDraftDto d : digest.getPendingDrafts()) {
                pendingRows.append(String.format("""
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px 12px; color: #1f2937;">%s</td>
                        <td style="padding: 8px 12px; color: #4b5563;">%s</td>
                        <td style="padding: 8px 12px; color: #6b7280; font-size: 12px;">%s</td>
                    </tr>
                    """,
                        escapeHtml(d.getRecipientEmail()),
                        escapeHtml(d.getCompany()),
                        escapeHtml(d.getSubject())
                ));
            }
        }

        String reviewDraftsCta = digest.getPendingDraftsCount() > 0 
                ? String.format("<div style='margin-top: 12px; text-align: center;'><a href='%s/drafts' style='display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px;'>Review %d Pending Drafts &rarr;</a></div>", baseUrl, digest.getPendingDraftsCount())
                : "";

        String dateFormatted = digest.getDigestDate() != null ? digest.getDigestDate().format(DATE_FORMATTER) : "Today";

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Daily EOD Digest</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
              <div style="max-width: 680px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #1e1b4b 0%%, #312e81 100%%); padding: 24px 32px; color: #ffffff;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">AutoApplyPro</h1>
                    <span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">EOD Synopsis</span>
                  </div>
                  <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 14px;">Daily Activity Summary for <strong>%s</strong> &bull; %s</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 24px 32px;">
                  
                  <!-- Key Metrics Grid -->
                  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
                    
                    <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                      <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Emails Dispatched</div>
                      <div style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 4px;">%d</div>
                      <div style="font-size: 11px; color: #10b981; margin-top: 2px;">%d successful, %d failed</div>
                    </div>

                    <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                      <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Left for Review</div>
                      <div style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 4px;">%d</div>
                      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Pending drafts in queue</div>
                    </div>

                    <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981;">
                      <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Applications Logged</div>
                      <div style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 4px;">%d</div>
                      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Tracked in Job Application DB</div>
                    </div>

                    <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                      <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Daily Quota Status</div>
                      <div style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 4px;">%d / %d</div>
                      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">%d remaining credits today</div>
                    </div>

                  </div>

                  <!-- Recipient Activity Log -->
                  <div style="margin-top: 28px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a;">Outreach Recipients Activity Log</h3>
                    <table style="width: 100%%; border-collapse: collapse; font-size: 13px; text-align: left; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                      <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569;">
                          <th style="padding: 10px 12px; font-weight: 600;">Recipient</th>
                          <th style="padding: 10px 12px; font-weight: 600;">Company</th>
                          <th style="padding: 10px 12px; font-weight: 600;">Subject</th>
                          <th style="padding: 10px 12px; font-weight: 600;">Channel</th>
                          <th style="padding: 10px 12px; font-weight: 600; text-align: right;">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        %s
                      </tbody>
                    </table>
                  </div>

                  <!-- Drafts Pending Review Section -->
                  %s

                  <!-- Interactive Feedback & Suggestions Section -->
                  <div style="margin-top: 36px; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%%, #f1f5f9 100%%); border-radius: 10px; border: 1px solid #cbd5e1; text-align: center;">
                    <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #0f172a;">How was your application outreach today?</h3>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b;">Rate your experience & help us improve AutoApplyPro for you:</p>
                    
                    <!-- 1-Click Star Rating Buttons -->
                    <div style="display: inline-flex; gap: 8px; margin-bottom: 16px;">
                      <a href="%s&rating=1" style="display: inline-block; padding: 8px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; text-decoration: none; font-size: 16px; transition: all 0.2s;">1 &#11088;</a>
                      <a href="%s&rating=2" style="display: inline-block; padding: 8px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; text-decoration: none; font-size: 16px; transition: all 0.2s;">2 &#11088;</a>
                      <a href="%s&rating=3" style="display: inline-block; padding: 8px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; text-decoration: none; font-size: 16px; transition: all 0.2s;">3 &#11088;</a>
                      <a href="%s&rating=4" style="display: inline-block; padding: 8px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; text-decoration: none; font-size: 16px; transition: all 0.2s;">4 &#11088;</a>
                      <a href="%s&rating=5" style="display: inline-block; padding: 8px 12px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; text-decoration: none; font-size: 16px; transition: all 0.2s;">5 &#11088;</a>
                    </div>

                    <div>
                      <a href="%s" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px;">Submit Detailed Feedback / Suggestion &rarr;</a>
                    </div>
                  </div>

                </div>

                <!-- Footer -->
                <div style="background: #f8fafc; padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
                  <p style="margin: 0 0 4px 0;">AutoApplyPro EOD Digest &bull; Sent automatically every day at 8:00 PM</p>
                  <p style="margin: 0;"><a href="%s/settings" style="color: #64748b; text-decoration: underline;">Configure Digest Preferences</a> &bull; <a href="%s/unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe</a></p>
                </div>

              </div>
            </body>
            </html>
            """,
                escapeHtml(digest.getUserName()),
                dateFormatted,
                digest.getTotalEmailsSentToday(),
                digest.getTotalEmailsSentToday() - digest.getTotalEmailsFailedToday(),
                digest.getTotalEmailsFailedToday(),
                digest.getPendingDraftsCount(),
                digest.getApplicationsLoggedCount(),
                digest.getSentTodayQuota(),
                digest.getDailyLimitQuota(),
                digest.getRemainingQuota(),
                recipientRows.toString(),
                reviewDraftsCta,
                digest.getFeedbackLink(),
                digest.getFeedbackLink(),
                digest.getFeedbackLink(),
                digest.getFeedbackLink(),
                digest.getFeedbackLink(),
                digest.getFeedbackLink(),
                baseUrl,
                baseUrl
        );
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }

    @Override
    @Transactional
    public boolean sendDailyDigestForUser(User user, LocalDate date) {
        if (user == null || user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return false;
        }

        try {
            log.info("Generating Daily EOD Digest for user: {} ({}) for date: {}", user.getName(), user.getEmail(), date);
            DailyDigestDto digest = generateDailyDigest(user, date);
            String htmlContent = buildDailyDigestHtml(digest);
            String subject = "AutoApplyPro EOD Digest — " + digest.getTotalEmailsSentToday() + " Emails Sent Today (" + date.format(DATE_FORMATTER) + ")";

            systemEmailService.sendDailyDigestEmail(user.getEmail(), subject, htmlContent);

            user.setLastDigestSentDate(date);
            userRepository.save(user);
            log.info("Successfully dispatched EOD Digest to user: {}", user.getEmail());
            return true;
        } catch (Exception e) {
            log.error("Failed to generate/send EOD digest for user: {}", user.getEmail(), e);
            return false;
        }
    }
}
