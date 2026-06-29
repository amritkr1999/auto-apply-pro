package com.backend.autoapplypro.modules.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfileDto {
    private Long id;
    private Long userId;
    private String email; // Owner email
    private String officialEmail;
    private String name;
    private String industry;
    private String website;
    private String description;
}
