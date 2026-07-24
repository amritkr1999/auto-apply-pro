package com.backend.autoapplypro.modules.billing.controller;

import com.backend.autoapplypro.modules.billing.dto.SubmitUtrRequest;
import com.backend.autoapplypro.modules.billing.dto.UpiPaymentResponse;
import com.backend.autoapplypro.modules.billing.model.UpiPaymentTransaction;
import com.backend.autoapplypro.modules.billing.service.UpiPaymentService;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class UpiPaymentController {

    private final UpiPaymentService upiPaymentService;
    private final UserRepository userRepository;

    /**
     * Accepts a 12-digit UPI UTR / Reference number from an authenticated user.
     */
    @PostMapping("/submit-utr")
    public ResponseEntity<?> submitUtr(Authentication authentication, @Valid @RequestBody SubmitUtrRequest request) {
        try {
            Long userId = (Long) authentication.getCredentials();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            UpiPaymentTransaction tx = upiPaymentService.submitUtr(user, request.getUtrNumber(), request.getAmount());

            UpiPaymentResponse response = UpiPaymentResponse.builder()
                    .id(tx.getId())
                    .utrNumber(tx.getUtrNumber())
                    .amount(tx.getAmount())
                    .status(tx.getStatus().name())
                    .createdAt(tx.getCreatedAt())
                    .isPremium(Boolean.TRUE.equals(user.getIsPremium()))
                    .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error submitting UTR payment", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to submit UTR: " + e.getMessage()));
        }
    }

    /**
     * Webhook listener for Telegram Bot inline button callbacks.
     */
    @PostMapping("/telegram-webhook")
    public ResponseEntity<String> telegramWebhook(@RequestBody Map<String, Object> updatePayload) {
        log.info("Received Telegram webhook update: {}", updatePayload);
        String result = upiPaymentService.handleTelegramCallback(updatePayload);
        return ResponseEntity.ok(result);
    }

    /**
     * Retrieves current user's premium status and latest UPI transaction info.
     */
    @GetMapping("/my-status")
    public ResponseEntity<?> getMyStatus(Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<UpiPaymentTransaction> latestTx = upiPaymentService.getLatestUserTransaction(userId);

        Map<String, Object> body = Map.of(
                "isPremium", Boolean.TRUE.equals(user.getIsPremium()),
                "role", user.getRole().name(),
                "latestTransaction", latestTx.map(tx -> Map.of(
                        "id", tx.getId(),
                        "utrNumber", tx.getUtrNumber(),
                        "amount", tx.getAmount(),
                        "status", tx.getStatus().name(),
                        "createdAt", tx.getCreatedAt()
                )).orElse(null)
        );

        return ResponseEntity.ok(body);
    }
}
