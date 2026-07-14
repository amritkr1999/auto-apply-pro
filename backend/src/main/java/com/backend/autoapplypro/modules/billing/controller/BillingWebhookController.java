package com.backend.autoapplypro.modules.billing.controller;

import com.backend.autoapplypro.modules.billing.service.BillingService;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
@Slf4j
public class BillingWebhookController {

    private final BillingService billingService;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestBody String body) {
        
        log.info("Received Razorpay webhook. Signature: {}", signature);

        if (signature == null || signature.isEmpty()) {
            log.warn("Missing X-Razorpay-Signature header");
            return ResponseEntity.ok("Signature missing"); // Return 200 to prevent retries
        }

        try {
            // Verify webhook signature
            boolean isValid = Utils.verifyWebhookSignature(body, signature, webhookSecret);
            if (!isValid) {
                log.error("Invalid webhook signature.");
                return ResponseEntity.ok("Invalid signature"); // Return 200 to prevent retries
            }

            // Parse body
            JSONObject json = new JSONObject(body);
            String eventType = json.optString("event");
            JSONObject payload = json.optJSONObject("payload");

            if (payload != null) {
                billingService.handleWebhookEvent(eventType, payload);
            } else {
                log.warn("Webhook event received with no payload");
            }

        } catch (Exception e) {
            log.error("Error processing Razorpay webhook", e);
        }

        return ResponseEntity.ok("OK");
    }
}
