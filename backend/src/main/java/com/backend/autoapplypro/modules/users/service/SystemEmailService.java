package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.dto.ContactRequestDto;

public interface SystemEmailService {
    void sendPasswordResetEmail(String recipientEmail, String resetLink);
    void sendPlaqueCardContactEmail(String recipientEmail, String candidateName, String senderName, String senderEmail, String senderCompany, String message);
    void sendEmailVerificationEmail(String recipientEmail, String verificationLink, String otpCode);
    void sendDailyDigestEmail(String recipientEmail, String subject, String htmlContent);
    void sendGeneralContactEmail(ContactRequestDto request);
    void sendCareersInterestAcknowledgementEmail(String recipientEmail);
    void sendTrialWarningEmail(String recipientEmail, String userName, long daysRemaining);
    void sendTrialExpiredEmail(String recipientEmail, String userName);
}

