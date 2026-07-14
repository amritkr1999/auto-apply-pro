package com.backend.autoapplypro.modules.jobs.controller;

import com.backend.autoapplypro.modules.jobs.dto.JobApplicationStatsDto;
import com.backend.autoapplypro.modules.jobs.model.JobApplication;
import com.backend.autoapplypro.modules.jobs.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import com.backend.autoapplypro.modules.jobs.repository.JobApplicationRepository;
import java.util.List;

@RestController
@RequestMapping("/api/job-applications")
@RequiredArgsConstructor
@Slf4j
public class JobApplicationController {

    private final JobApplicationService service;
    private final JobApplicationRepository repository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getApplications(Authentication authentication, @PathVariable Long userId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        Long callerUserId = (Long) authentication.getCredentials();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!userId.equals(callerUserId) && !isAdmin) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.getApplicationsForUser(userId));
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<?> getStats(Authentication authentication, @PathVariable Long userId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        Long callerUserId = (Long) authentication.getCredentials();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!userId.equals(callerUserId) && !isAdmin) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.getStatsForUser(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createApplication(Authentication authentication, @PathVariable Long userId, @RequestBody JobApplication application) {
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
            return ResponseEntity.ok(service.createApplication(userId, application));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateApplication(Authentication authentication, @PathVariable Long id, @RequestBody JobApplication application) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        Long callerUserId = (Long) authentication.getCredentials();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return repository.findById(id).map(existing -> {
            if (!existing.getUser().getId().equals(callerUserId) && !isAdmin) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
            try {
                return ResponseEntity.ok(service.updateApplication(id, application));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(Authentication authentication, @PathVariable Long id, @RequestParam String status) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        Long callerUserId = (Long) authentication.getCredentials();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return repository.findById(id).map(existing -> {
            if (!existing.getUser().getId().equals(callerUserId) && !isAdmin) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
            try {
                return ResponseEntity.ok(service.updateApplicationStatus(id, status));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(Authentication authentication, @PathVariable Long id) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        Long callerUserId = (Long) authentication.getCredentials();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return repository.findById(id).map(existing -> {
            if (!existing.getUser().getId().equals(callerUserId) && !isAdmin) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
            try {
                service.deleteApplication(id);
                return ResponseEntity.noContent().build();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.notFound().build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
