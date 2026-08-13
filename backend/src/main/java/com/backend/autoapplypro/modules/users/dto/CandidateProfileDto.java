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
public class CandidateProfileDto {
    private Long id;
    private Long userId;
    private String profileName;
    private Boolean isDefault;
    private String targetTemplateId;
    private String email;
    private String name;
    private String mobile;
    private String officialEmail;
    private List<String> skills;
    private Map<String, Object> jobPreferences;
    private String resumeFilename;
    private String coverLetterFilename;
    private String coverLetterContentType;
    private Boolean hasCoverLetter;
    private String defaultCoverLetterMode;
    private String defaultCoverLetterDeliveryType;
    private String defaultCoverLetterTemplateId;
    private String summary;
    private List<Map<String, Object>> education;
    private List<Map<String, Object>> experience;
    private List<String> certifications;
    private String githubUsername;
    private String githubProfileUrl;
    private String linkedinProfileUrl;
    private String linkedinName;
    private String avatar;
    private Boolean isProfilePublic;
    private String username;
    private Map<String, Object> githubStats;
    private Map<String, Object> leetcodeStats;
    private String leetcodeUsername;
    private Boolean isVerified;
    private String professionalVertical;
    private Integer trustScore;
    private List<AchievementDto> achievements;
    private List<String> excludedCompanies;
}
