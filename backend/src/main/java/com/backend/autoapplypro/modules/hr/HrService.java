package com.backend.autoapplypro.modules.hr;

import com.backend.autoapplypro.modules.hr.dto.HrRequestDto;
import com.backend.autoapplypro.modules.hr.dto.HrResponseDto;
import java.util.List;

public interface HrService {
    HrResponseDto saveHr(HrRequestDto hrRequestDto);
    List<HrResponseDto> getAllHrs();
    HrResponseDto getHrById(Long id);
    List<HrResponseDto> getHrsByCompany(String companyName);
    HrResponseDto updateHr(Long id, HrRequestDto hrRequestDto);
    void deleteHr(Long id);
}
