package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.dto.*;

public interface UserService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    
    CandidateProfileDto getCandidateProfile(Long userId);
    CandidateProfileDto updateCandidateProfile(Long userId, CandidateProfileDto dto);
    
    RecruiterProfileDto getRecruiterProfile(Long userId);
    RecruiterProfileDto updateRecruiterProfile(Long userId, RecruiterProfileDto dto);
    
    CompanyProfileDto getCompanyProfile(Long userId);
    CompanyProfileDto updateCompanyProfile(Long userId, CompanyProfileDto dto);
}
