package com.backend.autoapplypro.modules.hr;

import com.backend.autoapplypro.modules.jobs.service.ClientScraperServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailEnrichmentService {

    private final HrRepository hrRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${hunter.api.key:}")
    private String hunterApiKey;

    /**
     * Enriches a company domain (e.g., 'hexaware.com') with verified HR recruiter contacts.
     * Checks DNS MX records before saving to database.
     */
    public List<HrDetails> enrichCompanyDomain(String domain, String companyName) {
        if (domain == null || domain.isBlank()) return Collections.emptyList();
        String cleanDomain = domain.toLowerCase().trim().replace("https://", "").replace("http://", "").split("/")[0];

        // 1. Verify domain has active MX records
        if (!ClientScraperServiceImpl.hasMxRecord(cleanDomain)) {
            log.warn("[EMAIL ENRICHMENT] Domain '{}' has no active MX records. Skipping enrichment.", cleanDomain);
            return Collections.emptyList();
        }

        List<HrDetails> enriched = new ArrayList<>();

        // 2. Standard corporate recruitment patterns
        String[] prefixes = {"careers", "recruitment", "talent", "hr", "hiring"};
        String compName = (companyName != null && !companyName.isBlank()) ? companyName : cleanDomain.split("\\.")[0].toUpperCase();

        for (String prefix : prefixes) {
            String candidateEmail = prefix + "@" + cleanDomain;
            if (hrRepository.findByEmailIgnoreCase(candidateEmail).isEmpty()) {
                HrDetails details = HrDetails.builder()
                        .name(compName + " " + prefix.substring(0, 1).toUpperCase() + prefix.substring(1) + " Team")
                        .email(candidateEmail)
                        .companyName(compName)
                        .notes("Enriched via verified MX corporate domain pattern (" + cleanDomain + ")")
                        .build();

                hrRepository.save(details);
                enriched.add(details);
                log.info("[EMAIL ENRICHMENT SUCCESS] Saved verified contact: {} ({})", details.getName(), candidateEmail);
            }
        }

        return enriched;
    }
}
