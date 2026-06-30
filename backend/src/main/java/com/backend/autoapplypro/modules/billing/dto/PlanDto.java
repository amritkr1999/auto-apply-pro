package com.backend.autoapplypro.modules.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal amount;
    private String currency;
    private String billingInterval;
    private String razorpayPlanId;
}
