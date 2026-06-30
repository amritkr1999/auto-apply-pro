package com.backend.autoapplypro.modules.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionVerifyRequest {
    private String razorpayPaymentId;
    private String razorpaySubscriptionId;
    private String razorpaySignature;
}
