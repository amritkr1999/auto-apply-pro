package com.backend.autoapplypro.modules.outreach.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailGenerationResponseDto {
    private String subject;
    private String body;
    private String recipientEmail;
}
