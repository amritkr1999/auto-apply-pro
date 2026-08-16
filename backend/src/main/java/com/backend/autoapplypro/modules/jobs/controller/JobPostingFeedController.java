package com.backend.autoapplypro.modules.jobs.controller;

import com.backend.autoapplypro.modules.jobs.dto.JobPostingFeedDto;
import com.backend.autoapplypro.modules.jobs.service.ClientScraperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs/postings")
@RequiredArgsConstructor
public class JobPostingFeedController {

    private final ClientScraperService clientScraperService;

    /**
     * Retrieves the latest active job postings from the past 20 days.
     */
    @GetMapping("/latest")
    public ResponseEntity<List<JobPostingFeedDto>> getLatestJobFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        List<JobPostingFeedDto> feed = clientScraperService.getLatestJobPostingFeed(page, size);
        return ResponseEntity.ok(feed);
    }
}
