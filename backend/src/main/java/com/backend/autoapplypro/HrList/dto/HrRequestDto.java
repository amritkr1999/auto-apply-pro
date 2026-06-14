package com.backend.autoapplypro.HrList.dto;

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
