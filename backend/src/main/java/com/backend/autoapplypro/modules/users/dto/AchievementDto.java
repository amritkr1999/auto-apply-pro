package com.backend.autoapplypro.modules.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchievementDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String badgeUrl;
    private String verificationStatus;
    private Integer trustScore;
    private Boolean isVerified;
}
