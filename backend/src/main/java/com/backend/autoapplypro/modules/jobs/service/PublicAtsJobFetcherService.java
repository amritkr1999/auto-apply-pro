package com.backend.autoapplypro.modules.jobs.service;

import com.backend.autoapplypro.modules.hr.HrDetails;
import com.backend.autoapplypro.modules.hr.HrRepository;
import com.backend.autoapplypro.modules.jobs.model.JobPosting;
import com.backend.autoapplypro.modules.jobs.repository.JobPostingRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class PublicAtsJobFetcherService {

    private final JobPostingRepository jobPostingRepository;
    private final HrRepository hrRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Curated list of popular tech companies using Greenhouse or Lever
    private static final String[] GREENHOUSE_COMPANIES = {"stripe", "airbnb", "figma", "coinbase", "datadog", "gitlab", "discord", "hashicorp"};
    private static final String[] LEVER_COMPANIES = {"netflix", "spotify", "palantir", "scale", "postman"};

    @Data
    @Builder
    public static class PublicAtsFetchResult {
        private int totalNewJobs;
        private List<JobPosting> newJobPostings;
        private List<String> companiesScanned;
    }

    public PublicAtsFetchResult fetchLiveJobsWithDetails() {
        log.info("[PUBLIC ATS FETCHER] Starting live job fetching from Greenhouse and Lever public career APIs...");
        List<JobPosting> newPostings = new ArrayList<>();
        List<String> companiesScanned = new ArrayList<>();

        for (String company : GREENHOUSE_COMPANIES) {
            String capitalized = company.substring(0, 1).toUpperCase() + company.substring(1);
            companiesScanned.add(capitalized + " (Greenhouse)");
            newPostings.addAll(fetchGreenhouseJobsDetailed(company));
        }

        for (String company : LEVER_COMPANIES) {
            String capitalized = company.substring(0, 1).toUpperCase() + company.substring(1);
            companiesScanned.add(capitalized + " (Lever)");
            newPostings.addAll(fetchLeverJobsDetailed(company));
        }

        log.info("[PUBLIC ATS FETCHER] Completed live ingestion. Total new real jobs added: {}", newPostings.size());
        return PublicAtsFetchResult.builder()
                .totalNewJobs(newPostings.size())
                .newJobPostings(newPostings)
                .companiesScanned(companiesScanned)
                .build();
    }

    public int fetchLiveJobsFromPublicAts() {
        return fetchLiveJobsWithDetails().getTotalNewJobs();
    }

    private List<JobPosting> fetchGreenhouseJobsDetailed(String companySlug) {
        String url = "https://boards-api.greenhouse.io/v1/boards/" + companySlug + "/jobs?content=true";
        List<JobPosting> addedJobs = new ArrayList<>();
        try {
            String jsonResponse = restTemplate.getForObject(url, String.class);
            if (jsonResponse == null || jsonResponse.isBlank()) return addedJobs;

            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode jobsNode = root.path("jobs");
            if (jobsNode.isArray()) {
                String capitalizedCompany = companySlug.substring(0, 1).toUpperCase() + companySlug.substring(1);
                for (JsonNode job : jobsNode) {
                    String title = job.path("title").asText("");
                    String absoluteUrl = job.path("absolute_url").asText("");
                    String location = job.path("location").path("name").asText("Remote / Hybrid");

                    if (!title.isBlank() && !jobPostingRepository.existsByTitleAndCompany(title, capitalizedCompany)) {
                        String hrEmail = "careers@" + companySlug + ".com";

                        JobPosting posting = JobPosting.builder()
                                .title(title)
                                .company(capitalizedCompany)
                                .location(location)
                                .description("Live job posting from " + capitalizedCompany + " career portal. Apply at: " + absoluteUrl)
                                .requirements("Technical Skills required for " + title)
                                .salary("Industry Standard")
                                .sourceUrl(absoluteUrl)
                                .hrEmail(hrEmail)
                                .hrEmails(hrEmail)
                                .build();

                        JobPosting saved = jobPostingRepository.save(posting);
                        addedJobs.add(saved);

                        // Save clean HR contact if domain has MX record
                        if (ClientScraperServiceImpl.hasMxRecord(companySlug + ".com")) {
                            if (hrRepository.findByEmailIgnoreCase(hrEmail).isEmpty()) {
                                hrRepository.save(HrDetails.builder()
                                        .name(capitalizedCompany + " Recruitment Team")
                                        .email(hrEmail)
                                        .companyName(capitalizedCompany)
                                        .notes("Source: Greenhouse Public Board API")
                                        .build());
                            }
                        }
                    }
                    if (addedJobs.size() >= 5) break; // Limit per company per run to keep feed balanced
                }
            }
        } catch (Exception e) {
            log.warn("[GREENHOUSE FETCHER] Could not fetch jobs for company '{}': {}", companySlug, e.getMessage());
        }
        return addedJobs;
    }

    private List<JobPosting> fetchLeverJobsDetailed(String companySlug) {
        String url = "https://api.lever.co/v2/postings/" + companySlug;
        List<JobPosting> addedJobs = new ArrayList<>();
        try {
            String jsonResponse = restTemplate.getForObject(url, String.class);
            if (jsonResponse == null || jsonResponse.isBlank()) return addedJobs;

            JsonNode jobsNode = objectMapper.readTree(jsonResponse);
            if (jobsNode.isArray()) {
                String capitalizedCompany = companySlug.substring(0, 1).toUpperCase() + companySlug.substring(1);
                for (JsonNode job : jobsNode) {
                    String title = job.path("text").asText("");
                    String hostedUrl = job.path("hostedUrl").asText("");
                    String location = job.path("categories").path("location").asText("Remote / Hybrid");

                    if (!title.isBlank() && !jobPostingRepository.existsByTitleAndCompany(title, capitalizedCompany)) {
                        String hrEmail = "careers@" + companySlug + ".com";

                        JobPosting posting = JobPosting.builder()
                                .title(title)
                                .company(capitalizedCompany)
                                .location(location)
                                .description("Live job posting from " + capitalizedCompany + " career portal. Apply at: " + hostedUrl)
                                .requirements("Technical Skills required for " + title)
                                .salary("Industry Standard")
                                .sourceUrl(hostedUrl)
                                .hrEmail(hrEmail)
                                .hrEmails(hrEmail)
                                .build();

                        JobPosting saved = jobPostingRepository.save(posting);
                        addedJobs.add(saved);

                        if (ClientScraperServiceImpl.hasMxRecord(companySlug + ".com")) {
                            if (hrRepository.findByEmailIgnoreCase(hrEmail).isEmpty()) {
                                hrRepository.save(HrDetails.builder()
                                        .name(capitalizedCompany + " Talent Acquisition")
                                        .email(hrEmail)
                                        .companyName(capitalizedCompany)
                                        .notes("Source: Lever Public Board API")
                                        .build());
                            }
                        }
                    }
                    if (addedJobs.size() >= 5) break;
                }
            }
        } catch (Exception e) {
            log.warn("[LEVER FETCHER] Could not fetch jobs for company '{}': {}", companySlug, e.getMessage());
        }
        return addedJobs;
    }

    private int fetchGreenhouseJobs(String companySlug) {
        return fetchGreenhouseJobsDetailed(companySlug).size();
    }

    private int fetchLeverJobs(String companySlug) {
        return fetchLeverJobsDetailed(companySlug).size();
    }
}
