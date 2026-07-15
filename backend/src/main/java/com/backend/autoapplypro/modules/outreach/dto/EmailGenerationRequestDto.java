package com.backend.autoapplypro.modules.outreach.dto;

import com.backend.autoapplypro.modules.jobs.dto.JobDetailsDto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailGenerationRequestDto {
    private Long userId;
    private Long profileId;
    private JobDetailsDto jobDetails;
    private String templateId;
    private Boolean useAi;
    private String userTier; // "free" or "paid"
}
