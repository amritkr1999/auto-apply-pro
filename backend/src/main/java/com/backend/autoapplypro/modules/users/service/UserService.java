package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.dto.*;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    
    CandidateProfileDto getCandidateProfile(Long userId);
    CandidateProfileDto getCandidateProfileById(Long userId, Long profileId);
    java.util.List<CandidateProfileDto> getCandidateProfiles(Long userId);
    CandidateProfileDto updateCandidateProfile(Long userId, CandidateProfileDto dto);
    CandidateProfileDto updateCandidateProfile(Long userId, Long profileId, CandidateProfileDto dto);
    CandidateProfileDto createCandidateProfile(Long userId, String profileName);
    void selectDefaultProfile(Long userId, Long profileId);
    void deleteCandidateProfile(Long userId, Long profileId);
    
    RecruiterProfileDto getRecruiterProfile(Long userId);
    RecruiterProfileDto updateRecruiterProfile(Long userId, RecruiterProfileDto dto);
    
    CompanyProfileDto getCompanyProfile(Long userId);
    CompanyProfileDto updateCompanyProfile(Long userId, CompanyProfileDto dto);
    
    void uploadResume(Long userId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;
    void uploadResume(Long userId, Long profileId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;
    com.backend.autoapplypro.modules.users.model.ProfessionalProfile getCandidateResume(Long userId);
    com.backend.autoapplypro.modules.users.model.ProfessionalProfile getCandidateResume(Long userId, Long profileId);
    void syncProfileFromResume(Long userId);
    void syncProfileFromResume(Long userId, Long profileId);
    
    void initiatePasswordReset(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    
    void requestAccountDeletion(Long userId);
    void cancelAccountDeletion(Long userId);
}
