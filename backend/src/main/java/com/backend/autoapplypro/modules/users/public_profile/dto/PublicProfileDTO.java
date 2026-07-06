package com.backend.autoapplypro.modules.users.public_profile.dto;

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
public class PublicProfileDTO {
    private String username;
    private String name;
    private String summary;
    private String avatar;
    private String githubUsername;
    private String githubProfileUrl;
    private String linkedinProfileUrl;
    private String linkedinName;
    private Map<String, Object> githubStats;
    private Map<String, Object> leetcodeStats;
    private String leetcodeUsername;
    private Boolean isVerified;
    private List<String> skills;
}
