package com.backend.autoapplypro.modules.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionDto {
    private Long id;
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private BigDecimal amount;
    private String status;
    private String paymentMethod;
    private String errorCode;
    private String errorDescription;
    private LocalDateTime createdAt;
}
