package com.backend.autoapplypro.modules.referral_program.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrackClickRequestDto {
    @NotBlank(message = "Referral code is required")
    private String referralCode;
}
