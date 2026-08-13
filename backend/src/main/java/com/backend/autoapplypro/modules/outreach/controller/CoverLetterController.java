package com.backend.autoapplypro.modules.outreach.controller;

import com.backend.autoapplypro.modules.outreach.dto.CoverLetterRequestDto;
import com.backend.autoapplypro.modules.outreach.dto.CoverLetterResponseDto;
import com.backend.autoapplypro.modules.outreach.service.CoverLetterService;
import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
public class CoverLetterController {

    private final CoverLetterService coverLetterService;
    private final ProfessionalProfileRepository profileRepository;

    @PostMapping("/api/outreach/cover-letter/generate")
    public ResponseEntity<CoverLetterResponseDto> generateCoverLetter(
            @RequestBody CoverLetterRequestDto request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = (Long) authentication.getCredentials();
        request.setUserId(userId);

        CoverLetterResponseDto response = coverLetterService.generateCoverLetter(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/api/users/profile/cover-letter", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadCoverLetter(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = (Long) authentication.getCredentials();

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploaded cover letter file is empty");
        }

        try {
            ProfessionalProfile profile = profileRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + userId));

            profile.setCoverLetterFilename(file.getOriginalFilename());
            profile.setCoverLetterBytes(file.getBytes());
            profile.setCoverLetterContentType(file.getContentType());
            profile.setDefaultCoverLetterMode("UPLOADED");

            profileRepository.save(profile);
            log.info("Cover letter file '{}' uploaded successfully for user ID: {}", file.getOriginalFilename(), userId);
            return ResponseEntity.ok("Cover letter uploaded successfully");
        } catch (Exception e) {
            log.error("Failed to upload cover letter for user ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload cover letter: " + e.getMessage());
        }
    }

    @GetMapping("/api/users/profile/cover-letter")
    public ResponseEntity<byte[]> getCoverLetter(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = (Long) authentication.getCredentials();

        ProfessionalProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + userId));

        if (profile.getCoverLetterBytes() == null || profile.getCoverLetterBytes().length == 0) {
            return ResponseEntity.notFound().build();
        }

        String filename = profile.getCoverLetterFilename() != null ? profile.getCoverLetterFilename() : "Cover_Letter.pdf";
        String contentType = profile.getCoverLetterContentType() != null ? profile.getCoverLetterContentType() : "application/pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(profile.getCoverLetterBytes());
    }

    @DeleteMapping("/api/users/profile/cover-letter")
    public ResponseEntity<String> deleteCoverLetter(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = (Long) authentication.getCredentials();

        ProfessionalProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + userId));

        profile.setCoverLetterBytes(null);
        profile.setCoverLetterFilename(null);
        profile.setCoverLetterContentType(null);
        if ("UPLOADED".equals(profile.getDefaultCoverLetterMode())) {
            profile.setDefaultCoverLetterMode("TEMPLATE");
        }

        profileRepository.save(profile);
        log.info("Cover letter deleted successfully for user ID: {}", userId);
        return ResponseEntity.ok("Cover letter deleted successfully");
    }
}
