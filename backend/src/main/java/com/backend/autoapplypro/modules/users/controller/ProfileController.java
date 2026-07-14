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
    public ResponseEntity<?> updateCandidateProfile(
            @PathVariable Long userId,
            @RequestBody CandidateProfileDto dto) {
        try {
            return ResponseEntity.ok(userService.updateCandidateProfile(userId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/candidate/{userId}/all")
    public ResponseEntity<java.util.List<CandidateProfileDto>> getCandidateProfiles(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(userService.getCandidateProfiles(userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/candidate/{userId}/profile/{profileId}")
    public ResponseEntity<CandidateProfileDto> getCandidateProfileById(
            @PathVariable Long userId,
            @PathVariable Long profileId) {
        try {
            return ResponseEntity.ok(userService.getCandidateProfileById(userId, profileId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/candidate/{userId}/create")
    public ResponseEntity<?> createCandidateProfile(
            @PathVariable Long userId,
            @RequestParam("profileName") String profileName) {
        try {
            return ResponseEntity.ok(userService.createCandidateProfile(userId, profileName));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/candidate/{userId}/select/{profileId}")
    public ResponseEntity<?> selectDefaultProfile(
            @PathVariable Long userId,
            @PathVariable Long profileId) {
        try {
            userService.selectDefaultProfile(userId, profileId);
            return ResponseEntity.ok(java.util.Map.of("message", "Default profile updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/candidate/{userId}/profile/{profileId}")
    public ResponseEntity<?> updateCandidateProfileById(
            @PathVariable Long userId,
            @PathVariable Long profileId,
            @RequestBody CandidateProfileDto dto) {
        try {
            return ResponseEntity.ok(userService.updateCandidateProfile(userId, profileId, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/candidate/{userId}/profile/{profileId}")
    public ResponseEntity<?> deleteCandidateProfile(
            @PathVariable Long userId,
            @PathVariable Long profileId) {
        try {
            userService.deleteCandidateProfile(userId, profileId);
            return ResponseEntity.ok(java.util.Map.of("message", "Profile deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
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

    // RESUME UPLOAD / DOWNLOAD
    @PostMapping(value = "/candidate/{userId}/resume", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResume(
            @PathVariable Long userId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            userService.uploadResume(userId, file);
            return ResponseEntity.ok(java.util.Map.of("message", "Resume uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload resume: " + e.getMessage());
        }
    }

    @PostMapping(value = "/candidate/{userId}/profile/{profileId}/resume", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResumeById(
            @PathVariable Long userId,
            @PathVariable Long profileId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            userService.uploadResume(userId, profileId, file);
            return ResponseEntity.ok(java.util.Map.of("message", "Resume uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload resume: " + e.getMessage());
        }
    }

    @PostMapping("/candidate/{userId}/resume/sync")
    public ResponseEntity<?> syncProfile(@PathVariable Long userId) {
        try {
            userService.syncProfileFromResume(userId);
            return ResponseEntity.ok(java.util.Map.of("message", "Profile successfully synchronized with resume."));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to sync profile: " + e.getMessage());
        }
    }

    @PostMapping("/candidate/{userId}/profile/{profileId}/resume/sync")
    public ResponseEntity<?> syncProfileById(
            @PathVariable Long userId,
            @PathVariable Long profileId) {
        try {
            userService.syncProfileFromResume(userId, profileId);
            return ResponseEntity.ok(java.util.Map.of("message", "Profile successfully synchronized with resume."));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to sync profile: " + e.getMessage());
        }
    }

    @GetMapping("/candidate/{userId}/resume")
    public ResponseEntity<org.springframework.core.io.ByteArrayResource> getResume(@PathVariable Long userId) {
        try {
            com.backend.autoapplypro.modules.users.model.ProfessionalProfile candidate = userService.getCandidateResume(userId);
            if (candidate.getResumeBytes() == null) {
                return ResponseEntity.notFound().build();
            }

            org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(candidate.getResumeBytes());
            String contentType = candidate.getResumeContentType() != null ? candidate.getResumeContentType() : "application/octet-stream";
            String filename = candidate.getResumeFilename() != null ? candidate.getResumeFilename() : "resume.pdf";

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/candidate/{userId}/profile/{profileId}/resume")
    public ResponseEntity<org.springframework.core.io.ByteArrayResource> getResumeById(
            @PathVariable Long userId,
            @PathVariable Long profileId) {
        try {
            com.backend.autoapplypro.modules.users.model.ProfessionalProfile candidate = userService.getCandidateResume(userId, profileId);
            if (candidate.getResumeBytes() == null) {
                return ResponseEntity.notFound().build();
            }

            org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(candidate.getResumeBytes());
            String contentType = candidate.getResumeContentType() != null ? candidate.getResumeContentType() : "application/octet-stream";
            String filename = candidate.getResumeFilename() != null ? candidate.getResumeFilename() : "resume.pdf";

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/delete-request")
    public ResponseEntity<?> deleteAccount(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = (Long) authentication.getCredentials();
        try {
            userService.requestAccountDeletion(userId);
            return ResponseEntity.ok(java.util.Map.of("message", "Account deletion request submitted successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/cancel-delete")
    public ResponseEntity<?> cancelDeleteAccount(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = (Long) authentication.getCredentials();
        try {
            userService.cancelAccountDeletion(userId);
            return ResponseEntity.ok(java.util.Map.of("message", "Account deletion request cancelled."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
