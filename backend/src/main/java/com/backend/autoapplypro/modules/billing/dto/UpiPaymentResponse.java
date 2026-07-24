package com.backend.autoapplypro.modules.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpiPaymentResponse {
    private Long id;
    private String utrNumber;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;
    private Boolean isPremium;
}
