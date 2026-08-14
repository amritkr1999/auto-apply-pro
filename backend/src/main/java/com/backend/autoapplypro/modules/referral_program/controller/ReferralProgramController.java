package com.backend.autoapplypro.modules.referral_program.controller;

import com.backend.autoapplypro.modules.referral_program.dto.ReferralDashboardDto;
import com.backend.autoapplypro.modules.referral_program.dto.ReferralStatusResponseDto;
import com.backend.autoapplypro.modules.referral_program.dto.TrackClickRequestDto;
import com.backend.autoapplypro.modules.referral_program.service.ReferralProgramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/referral-program")
@RequiredArgsConstructor
public class ReferralProgramController {

    private final ReferralProgramService referralProgramService;

    @GetMapping("/my-program")
    public ResponseEntity<ReferralDashboardDto> getMyReferralProgram(@RequestParam("userId") Long userId) {
        return ResponseEntity.ok(referralProgramService.getUserDashboard(userId));
    }

    @PostMapping("/track-click")
    public ResponseEntity<?> trackClick(@Valid @RequestBody TrackClickRequestDto request) {
        referralProgramService.trackClick(request.getReferralCode());
        return ResponseEntity.ok(Map.of("message", "Click tracked successfully"));
    }

    @GetMapping("/status")
    public ResponseEntity<ReferralStatusResponseDto> getProgramStatus() {
        return ResponseEntity.ok(referralProgramService.getProgramStatus());
    }
}
