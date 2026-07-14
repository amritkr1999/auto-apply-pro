package com.backend.autoapplypro.modules.hr.dto;

import lombok.Data;

@Data
public class HrRequestDto {
    private String name;
    private String email;
    private String companyName;
    private String linkedinUrl;
    private String phoneNumber;
    private String notes;
}
