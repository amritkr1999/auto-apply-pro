package com.backend.autoapplypro.modules.outreach.dto;

import com.backend.autoapplypro.modules.jobs.dto.JobDetailsDto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoverLetterRequestDto {
    private Long userId;
    private Long profileId;
    private JobDetailsDto jobDetails;
    private String templateId;
    private String mode; // "TEMPLATE", "UPLOADED", "AI_GENERATED", "NONE"
    private String deliveryType; // "ATTACHMENT", "INLINE"
    private String candidateName;
}
