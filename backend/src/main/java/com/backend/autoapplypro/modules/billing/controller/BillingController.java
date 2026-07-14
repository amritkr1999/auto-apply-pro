package com.backend.autoapplypro.modules.billing.controller;

import com.backend.autoapplypro.modules.billing.dto.*;
import com.backend.autoapplypro.modules.billing.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
@Slf4j
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/plans")
    public ResponseEntity<List<PlanDto>> getPlans() {
        return ResponseEntity.ok(billingService.getActivePlans());
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> createSubscription(Authentication authentication, @RequestBody CreateSubscriptionRequest request) {
        try {
            Long userId = (Long) authentication.getCredentials();
            Map<String, Object> response = billingService.createSubscription(userId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating subscription", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifySubscription(Authentication authentication, @RequestBody SubscriptionVerifyRequest request) {
        try {
            Long userId = (Long) authentication.getCredentials();
            boolean isVerified = billingService.verifySubscription(userId, request);
            if (isVerified) {
                return ResponseEntity.ok(Map.of("message", "Subscription verified successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid signature or verification failed"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error verifying subscription", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelSubscription(Authentication authentication) {
        try {
            Long userId = (Long) authentication.getCredentials();
            SubscriptionDto dto = billingService.cancelSubscription(userId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error cancelling subscription", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/subscription")
    public ResponseEntity<SubscriptionDto> getActiveSubscription(Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        SubscriptionDto dto = billingService.getActiveSubscription(userId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<PaymentTransactionDto>> getPaymentHistory(Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        List<PaymentTransactionDto> transactions = billingService.getPaymentHistory(userId);
        return ResponseEntity.ok(transactions);
    }
}
