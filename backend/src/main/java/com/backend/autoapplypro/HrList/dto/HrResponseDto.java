package com.backend.autoapplypro.HrList.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HrResponseDto {
    private Long id;
    private String name;
    private String email;
    private String companyName;
    private String linkedinUrl;
    private String phoneNumber;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
