package com.backend.autoapplypro.modules.users.service;

public interface SystemEmailService {
    void sendPasswordResetEmail(String recipientEmail, String resetLink);
}
