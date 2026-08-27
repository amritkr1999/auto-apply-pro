package com.backend.autoapplypro.modules.jobs.service;

import com.backend.autoapplypro.modules.jobs.dto.ClientScrapePayloadDto;
import com.backend.autoapplypro.modules.jobs.dto.JobPostingFeedDto;
import com.backend.autoapplypro.modules.users.model.User;

import java.util.List;
import java.util.Map;

import com.backend.autoapplypro.modules.jobs.dto.RawHarvestedJobDto;

public interface ClientScraperService {
    Map<String, Object> processClientScrapePayload(ClientScrapePayloadDto payload, User user);
    List<JobPostingFeedDto> getLatestJobPostingFeed(int page, int size);
    List<RawHarvestedJobDto> getLatestRawHarvestedJobs(int page, int size);
    List<String> getClientTasksForUser(User user);
}
