package com.backend.autoapplypro.modules.users.public_profile.dto;

import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@MappedSuperclass
public class AchievementCard {
    private String title;
    private String description;
    private String category; // e.g. "GitHub", "LeetCode", "Projects", "Verification"
    private String badgeUrl;
    private Integer trustScore;
    private Boolean isVerified;
}
