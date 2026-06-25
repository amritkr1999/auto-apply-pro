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
    private String subject;
    private String body;
    private String status;
    private String sentAt;
    private String errorMessage;
}
