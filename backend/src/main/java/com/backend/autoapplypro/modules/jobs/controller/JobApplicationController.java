package com.backend.autoapplypro.modules.jobs.controller;

import com.backend.autoapplypro.modules.jobs.dto.JobApplicationStatsDto;
import com.backend.autoapplypro.modules.jobs.model.JobApplication;
import com.backend.autoapplypro.modules.jobs.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-applications")
@RequiredArgsConstructor
@Slf4j
public class JobApplicationController {

    private final JobApplicationService service;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<JobApplication>> getApplications(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getApplicationsForUser(userId));
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<JobApplicationStatsDto> getStats(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getStatsForUser(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<JobApplication> createApplication(@PathVariable Long userId, @RequestBody JobApplication application) {
        try {
            return ResponseEntity.ok(service.createApplication(userId, application));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateApplication(@PathVariable Long id, @RequestBody JobApplication application) {
        try {
            return ResponseEntity.ok(service.updateApplication(id, application));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<JobApplication> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(service.updateApplicationStatus(id, status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        try {
            service.deleteApplication(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
