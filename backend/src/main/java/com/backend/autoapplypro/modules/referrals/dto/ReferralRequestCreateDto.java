package com.backend.autoapplypro.modules.referrals.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralRequestCreateDto {
    private String companyName;
    private String jobId;
    private String jobLink;
}
