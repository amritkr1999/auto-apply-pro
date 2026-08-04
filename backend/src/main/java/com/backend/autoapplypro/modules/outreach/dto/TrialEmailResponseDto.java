package com.backend.autoapplypro.modules.outreach.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialEmailResponseDto {
    private boolean success;
    private String message;
    private String recipientEmail;
    private String renderedSubject;
    private String sentAt;
}
