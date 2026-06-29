package com.backend.autoapplypro.modules.referrals.service;

import com.backend.autoapplypro.modules.referrals.dto.ReferralRequestCreateDto;
import com.backend.autoapplypro.modules.referrals.dto.ReferralRequestDto;
import java.util.List;

public interface ReferralService {
    ReferralRequestDto createRequest(Long userId, ReferralRequestCreateDto dto);
    List<ReferralRequestDto> getRequests(Long userId);
    ReferralRequestDto getRequest(Long id);
}
