package com.backend.autoapplypro.modules.outreach.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutreachDraftDto {
    private String id;
    private String templateId;
    private String recipientEmail;
    private String ccEmails;
    private String parsedEmails;
    private String subject;
    private String body;
    private String status;
    private String sentAt;
    private String scheduledAt;
    private String errorMessage;
    private Long userId;
}
