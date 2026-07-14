package com.backend.autoapplypro.modules.users.public_profile.dto;

import java.util.Map;

public interface PublicProfileProjection {
    String getUsername();
    String getName();
    String getSummary();
    String getAvatar();
    String getGithubUsername();
    String getGithubProfileUrl();
    String getLinkedinProfileUrl();
    String getLinkedinName();
    Map<String, Object> getGithubStats();
    Map<String, Object> getLeetcodeStats();
    String getLeetcodeUsername();
    Boolean getIsVerified();
}
