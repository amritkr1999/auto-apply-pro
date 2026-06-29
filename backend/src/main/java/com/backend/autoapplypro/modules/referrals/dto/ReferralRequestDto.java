package com.backend.autoapplypro.modules.referrals.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralRequestDto {
    private Long id;
    private Long userId;
    private String companyName;
    private String companyDomain;
    private String jobId;
    private String jobLink;
    private String jobTitle;
    private String jobDescription;
    private List<String> skillsRequired;
    private String experienceRequired;
    private String status;
    private long matchedProfessionals;
    private LocalDateTime createdAt;
}
