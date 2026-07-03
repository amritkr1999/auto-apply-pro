package com.backend.autoapplypro.modules.referrals.controller;

import com.backend.autoapplypro.modules.referrals.dto.ReferralRequestCreateDto;
import com.backend.autoapplypro.modules.referrals.dto.ReferralRequestDto;
import com.backend.autoapplypro.modules.referrals.service.ReferralService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    @PostMapping("/request")
    public ResponseEntity<ReferralRequestDto> createRequest(
            @RequestParam Long userId,
            @RequestBody ReferralRequestCreateDto dto) {
        try {
            return ResponseEntity.ok(referralService.createRequest(userId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<List<ReferralRequestDto>> getRequests(@RequestParam Long userId) {
        return ResponseEntity.ok(referralService.getRequests(userId));
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<ReferralRequestDto> getRequest(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(referralService.getRequest(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
