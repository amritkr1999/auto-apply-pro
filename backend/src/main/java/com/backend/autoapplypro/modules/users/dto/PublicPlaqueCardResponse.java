package com.backend.autoapplypro.modules.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicPlaqueCardResponse {
    private PlaqueCardDto card;
    private Long userId;
    
    // Profile info mapping
    private String name;
    private String username;
    private String avatar;
    private Boolean isVerified;
    private String professionalVertical;
    private String summary;
    private List<String> skills;
    private List<Map<String, Object>> education;
    private List<Map<String, Object>> experience;
    private List<AchievementDto> achievements;
    
    // Connected social links
    private String githubUsername;
    private String githubProfileUrl;
    private String linkedinProfileUrl;
    private String linkedinName;
    private String leetcodeUsername;
    private Map<String, Object> githubStats;
    private Map<String, Object> leetcodeStats;
}
