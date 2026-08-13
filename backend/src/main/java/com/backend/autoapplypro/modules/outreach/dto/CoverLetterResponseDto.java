package com.backend.autoapplypro.modules.outreach.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoverLetterResponseDto {
    private String mode; // TEMPLATE, UPLOADED, AI_GENERATED, NONE
    private String deliveryType; // ATTACHMENT, INLINE
    private String content; // rendered text content
    private String filename;
    private String contentType;
    private Boolean isAiAvailable;
    private String message;
    private byte[] pdfBytes;
}
