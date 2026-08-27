package com.backend.autoapplypro.modules.jobs.controller;

import com.backend.autoapplypro.modules.hr.HrRepository;
import com.backend.autoapplypro.modules.jobs.dto.ClientScrapePayloadDto;
import com.backend.autoapplypro.modules.jobs.repository.JobPostingRepository;
import com.backend.autoapplypro.modules.jobs.service.ClientScraperService;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.backend.autoapplypro.modules.jobs.dto.RawHarvestedJobDto;

@RestController
@RequestMapping("/api/v1/jobs/scraper")
@RequiredArgsConstructor
@Slf4j
public class ClientScraperController {

    private final ClientScraperService clientScraperService;
    private final UserRepository userRepository;
    private final HrRepository hrRepository;
    private final JobPostingRepository jobPostingRepository;

    @GetMapping("/raw-harvested/latest")
    public ResponseEntity<List<RawHarvestedJobDto>> getLatestRawHarvestedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        List<RawHarvestedJobDto> jobs = clientScraperService.getLatestRawHarvestedJobs(page, size);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/client-tasks")
    public ResponseEntity<List<String>> getClientTasks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = null;
        if (userDetails != null) {
            user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        }
        List<String> tasks = clientScraperService.getClientTasksForUser(user);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/client-sync")
    public ResponseEntity<Map<String, Object>> syncClientScrapePayload(
            @RequestBody ClientScrapePayloadDto payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = null;
        if (userDetails != null) {
            user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        }
        
        Map<String, Object> response = clientScraperService.processClientScrapePayload(payload, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getScraperStats() {
        long totalHrContacts = hrRepository.count();
        long totalJobPostings = jobPostingRepository.count();
        return ResponseEntity.ok(Map.of(
            "totalHrContacts", totalHrContacts,
            "totalJobPostings", totalJobPostings
        ));
    }
}
