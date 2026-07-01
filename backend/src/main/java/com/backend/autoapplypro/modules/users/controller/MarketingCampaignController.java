package com.backend.autoapplypro.modules.users.controller;

import com.backend.autoapplypro.modules.users.service.MarketingEmailCampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/marketing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MarketingCampaignController {

    private final MarketingEmailCampaignService campaignService;

    @PostMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token is required."));
        }
        try {
            campaignService.unsubscribeUser(token);
            return ResponseEntity.ok(Map.of("message", "Successfully unsubscribed from all marketing emails."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An error occurred during unsubscribe."));
        }
    }

    @GetMapping("/unsubscribe/direct")
    public ResponseEntity<String> unsubscribeDirect(@RequestParam String token) {
        try {
            campaignService.unsubscribeUser(token);
            return ResponseEntity.ok("Successfully unsubscribed from all marketing emails.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired unsubscribe token.");
        }
    }
}
