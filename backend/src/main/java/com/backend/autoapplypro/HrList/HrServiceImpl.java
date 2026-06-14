package com.backend.autoapplypro.HrList;

import com.backend.autoapplypro.HrList.dto.HrRequestDto;
import com.backend.autoapplypro.HrList.dto.HrResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HrServiceImpl implements HrService {

    private final HrRepository hrRepository;

    @Override
    public HrResponseDto saveHr(HrRequestDto dto) {
        HrDetails hrDetails = HrDetails.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .companyName(dto.getCompanyName())
                .linkedinUrl(dto.getLinkedinUrl())
                .phoneNumber(dto.getPhoneNumber())
                .notes(dto.getNotes())
                .build();
        
        HrDetails saved = hrRepository.save(hrDetails);
        return mapToResponseDto(saved);
    }

    @Override
    public List<HrResponseDto> getAllHrs() {
        return hrRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public HrResponseDto getHrById(Long id) {
        HrDetails hrDetails = hrRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HR record not found with id: " + id));
        return mapToResponseDto(hrDetails);
    }

    @Override
    public List<HrResponseDto> getHrsByCompany(String companyName) {
        return hrRepository.findByCompanyNameContainingIgnoreCase(companyName).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public HrResponseDto updateHr(Long id, HrRequestDto dto) {
        HrDetails hrDetails = hrRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HR record not found with id: " + id));
        
        hrDetails.setName(dto.getName());
        hrDetails.setEmail(dto.getEmail());
        hrDetails.setCompanyName(dto.getCompanyName());
        hrDetails.setLinkedinUrl(dto.getLinkedinUrl());
        hrDetails.setPhoneNumber(dto.getPhoneNumber());
        hrDetails.setNotes(dto.getNotes());
        
        HrDetails updated = hrRepository.save(hrDetails);
        return mapToResponseDto(updated);
    }

    @Override
    public void deleteHr(Long id) {
        if (!hrRepository.existsById(id)) {
            throw new RuntimeException("HR record not found with id: " + id);
        }
        hrRepository.deleteById(id);
    }

    private HrResponseDto mapToResponseDto(HrDetails hrDetails) {
        HrResponseDto response = new HrResponseDto();
        response.setId(hrDetails.getId());
        response.setName(hrDetails.getName());
        response.setEmail(hrDetails.getEmail());
        response.setCompanyName(hrDetails.getCompanyName());
        response.setLinkedinUrl(hrDetails.getLinkedinUrl());
        response.setPhoneNumber(hrDetails.getPhoneNumber());
        response.setNotes(hrDetails.getNotes());
        response.setCreatedAt(hrDetails.getCreatedAt());
        response.setUpdatedAt(hrDetails.getUpdatedAt());
        return response;
    }
}
