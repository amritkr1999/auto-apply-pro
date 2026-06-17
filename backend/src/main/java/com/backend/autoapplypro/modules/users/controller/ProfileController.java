package com.backend.autoapplypro.modules.users.controller;

import com.backend.autoapplypro.modules.users.dto.CandidateProfileDto;
import com.backend.autoapplypro.modules.users.dto.CompanyProfileDto;
import com.backend.autoapplypro.modules.users.dto.RecruiterProfileDto;
import com.backend.autoapplypro.modules.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfileController {

    private final UserService userService;

    // CANDIDATE PROFILE
    @GetMapping("/candidate/{userId}")
    public ResponseEntity<CandidateProfileDto> getCandidateProfile(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(userService.getCandidateProfile(userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/candidate/{userId}")
    public ResponseEntity<CandidateProfileDto> updateCandidateProfile(
            @PathVariable Long userId,
            @RequestBody CandidateProfileDto dto) {
        try {
            return ResponseEntity.ok(userService.updateCandidateProfile(userId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // RECRUITER PROFILE
    @GetMapping("/recruiter/{userId}")
    public ResponseEntity<RecruiterProfileDto> getRecruiterProfile(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(userService.getRecruiterProfile(userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/recruiter/{userId}")
    public ResponseEntity<RecruiterProfileDto> updateRecruiterProfile(
            @PathVariable Long userId,
            @RequestBody RecruiterProfileDto dto) {
        try {
            return ResponseEntity.ok(userService.updateRecruiterProfile(userId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // COMPANY PROFILE
    @GetMapping("/company/{userId}")
    public ResponseEntity<CompanyProfileDto> getCompanyProfile(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(userService.getCompanyProfile(userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/company/{userId}")
    public ResponseEntity<CompanyProfileDto> updateCompanyProfile(
            @PathVariable Long userId,
            @RequestBody CompanyProfileDto dto) {
        try {
            return ResponseEntity.ok(userService.updateCompanyProfile(userId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
