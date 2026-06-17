package com.backend.autoapplypro.modules.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruiterProfileDto {
    private Long id;
    private Long userId;
    private String email;
    private String name;
    private String mobile;
    private Long companyId;
    private String companyName;
}
