package com.backend.autoapplypro.modules.outreach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyDigestDto {

    private LocalDate digestDate;
    private String userName;
    private String userEmail;

    // Overall Counts
    private int totalEmailsSentToday;
    private int totalEmailsFailedToday;
    private int pendingDraftsCount;
    private int applicationsLoggedCount;

    // Quota statistics
    private int sentTodayQuota;
    private int dailyLimitQuota;
    private int remainingQuota;

    // Breakdown by Mode
    private Map<String, Integer> sentByModeBreakdown;

    // Detailed Recipient Activity Log
    private List<RecipientDetailDto> recipients;

    // Pending Drafts summary (Emails left for review)
    private List<PendingDraftDto> pendingDrafts;

    // Direct Feedback link for email rating button
    private String feedbackLink;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecipientDetailDto {
        private String recipientEmail;
        private String recipientName;
        private String company;
        private String jobTitle;
        private String subject;
        private String outreachMode; // e.g. "Cold Email", "HR Campaign", "Plaque Card"
        private String status;       // "SENT", "FAILED"
        private String sentTimeFormatted;
        private String errorMessage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PendingDraftDto {
        private Long draftId;
        private String recipientEmail;
        private String company;
        private String jobTitle;
        private String subject;
        private String createdAtFormatted;
    }
}
