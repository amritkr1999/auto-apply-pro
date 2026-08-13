package com.backend.autoapplypro.modules.outreach.service;

public interface EmailSender {
    /**
     * Sends an email on behalf of the user using their connected profile credentials.
     *
     * @param userId   The ID of the user sending the email.
     * @param to       The recipient's email address.
     * @param subject  The email subject line.
     * @param body     The email body content.
     */
    void sendEmail(Long userId, String to, String subject, String body);
    void sendEmail(Long userId, String to, String cc, String subject, String body);
    void sendEmail(Long userId, String to, String cc, String subject, String body, byte[] coverLetterBytes, String coverLetterContentType, String coverLetterFilename);
}
