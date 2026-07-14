package com.backend.autoapplypro.modules.users.service;

public interface SystemEmailService {
    void sendPasswordResetEmail(String recipientEmail, String resetLink);
    void sendPlaqueCardContactEmail(String recipientEmail, String candidateName, String senderName, String senderEmail, String senderCompany, String message);
}
