package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.outreach.dto.CoverLetterRequestDto;
import com.backend.autoapplypro.modules.outreach.dto.CoverLetterResponseDto;

public interface CoverLetterService {
    CoverLetterResponseDto generateCoverLetter(CoverLetterRequestDto dto);
}
