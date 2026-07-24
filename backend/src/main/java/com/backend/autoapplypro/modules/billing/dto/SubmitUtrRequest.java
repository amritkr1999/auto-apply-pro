package com.backend.autoapplypro.modules.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SubmitUtrRequest {

    @NotBlank(message = "UTR number is required")
    @Pattern(regexp = "^[0-9]{12}$", message = "UTR number must be exactly 12 digits")
    private String utrNumber;

    private BigDecimal amount;
}
