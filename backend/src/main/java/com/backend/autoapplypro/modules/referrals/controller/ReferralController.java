package com.backend.autoapplypro.modules.referrals.controller;

import com.backend.autoapplypro.modules.referrals.dto.ReferralRequestCreateDto;
import com.backend.autoapplypro.modules.referrals.dto.ReferralRequestDto;
import com.backend.autoapplypro.modules.referrals.service.ReferralService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api/v1/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    @PostMapping("/request")
    public ResponseEntity<?> createRequest(
            Authentication authentication,
            @RequestParam Long userId,
            @RequestBody ReferralRequestCreateDto dto) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        Long callerUserId = (Long) authentication.getCredentials();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!userId.equals(callerUserId) && !isAdmin) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        try {
            return ResponseEntity.ok(referralService.createRequest(userId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<?> getRequests(Authentication authentication, @RequestParam Long userId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        Long callerUserId = (Long) authentication.getCredentials();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!userId.equals(callerUserId) && !isAdmin) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(referralService.getRequests(userId));
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<?> getRequest(Authentication authentication, @PathVariable Long id) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        Long callerUserId = (Long) authentication.getCredentials();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        try {
            ReferralRequestDto requestDto = referralService.getRequest(id);
            if (!requestDto.getUserId().equals(callerUserId) && !isAdmin) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.ok(requestDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
