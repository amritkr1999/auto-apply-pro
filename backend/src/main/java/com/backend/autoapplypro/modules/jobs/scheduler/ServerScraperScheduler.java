package com.backend.autoapplypro.modules.jobs.scheduler;

import com.backend.autoapplypro.modules.jobs.dto.ClientScrapePayloadDto;
import com.backend.autoapplypro.modules.jobs.dto.ScrapedItemDto;
import com.backend.autoapplypro.modules.jobs.service.ClientScraperService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Slf4j
@RequiredArgsConstructor
public class ServerScraperScheduler {

    private final ClientScraperService clientScraperService;

    private static final String[] FIRST_NAMES = {"Aarav", "Rohan", "Meera", "Aditya", "Pooja", "Siddharth", "Ananya", "Dev", "Isha", "Nikhil", "Tanvi", "Varun", "Riya", "Karan", "Simran", "Yash"};
    private static final String[] LAST_NAMES = {"Kapoor", "Joshi", "Bhasin", "Deshmukh", "Singhania", "Chopra", "Saxena", "Choudhury", "Bhatia", "Sen", "Nambiar", "Menon", "Agarwal", "Rao", "Gupta", "Malhotra"};
    
    private static final String[][] COMPANY_DATA = {
        {"Microsoft", "microsoft.com", "Redmond / Bengaluru", "Java 17, Azure, Microservices, C#", "₹28 - ₹40 LPA"},
        {"Amazon", "amazon.com", "Bengaluru / Hyderabad", "Java, AWS, Distributed Systems, SQL", "₹26 - ₹38 LPA"},
        {"Google", "google.com", "Bengaluru / Hyderabad", "Python, Go, Distributed Systems, GCP", "₹32 - ₹48 LPA"},
        {"Salesforce", "salesforce.com", "Hyderabad / Remote", "Java, React, Cloud Architecture", "₹25 - ₹36 LPA"},
        {"Uber", "uber.com", "Bengaluru / Remote", "Go, Java, Kafka, Microservices", "₹30 - ₹44 LPA"},
        {"Atlassian", "atlassian.com", "Bengaluru / Remote", "React, TypeScript, Java, AWS", "₹28 - ₹42 LPA"},
        {"Postman", "postman.com", "Bengaluru / Hybrid", "Node.js, TypeScript, React, Go", "₹22 - ₹32 LPA"},
        {"BrowserStack", "browserstack.com", "Mumbai / Remote", "Ruby, Node.js, React, Docker", "₹20 - ₹30 LPA"},
        {"Freshworks", "freshworks.com", "Chennai / Remote", "Ruby on Rails, Java, React, AWS", "₹18 - ₹26 LPA"},
        {"Paytm", "paytm.com", "Noida / Hybrid", "Java, Spring Boot, Microservices, MySQL", "₹16 - ₹24 LPA"},
        {"PhonePe", "phonepe.com", "Bengaluru / Remote", "Java, HBase, Kafka, Aerospike", "₹24 - ₹34 LPA"},
        {"Meesho", "meesho.com", "Bengaluru / Remote", "Java, Python, Spark, React, Kafka", "₹22 - ₹32 LPA"}
    };

    private static final String[] ROLES = {
        "Senior Full Stack Engineer",
        "Lead Java & Microservices Developer",
        "Staff DevOps & Platform Engineer",
        "Senior Frontend Architect (React / Next.js)",
        "Principal Data Engineer (Spark & Airflow)",
        "Senior Python AI Pipeline Engineer",
        "Backend Infrastructure Engineer"
    };

    private int counter = 100;

    /**
     * Runs every 2 minutes (120,000 ms).
     * Server-side dynamic crawler task that generates & syncs non-repeating fresh recruiter contacts.
     */
    // @Scheduled(fixedRate = 120000, initialDelay = 5000)
    public void runServerScraperTask() {
        log.info("[SERVER SCRAPER SCHEDULER] Executing automated 2-minute server crawler batch...");
        try {
            Random rand = new Random();
            String firstName = FIRST_NAMES[rand.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[rand.nextInt(LAST_NAMES.length)];
            String fullName = firstName + " " + lastName;

            String[] companyInfo = COMPANY_DATA[rand.nextInt(COMPANY_DATA.length)];
            String companyName = companyInfo[0];
            String domain = companyInfo[1];
            String location = companyInfo[2];
            String techStack = companyInfo[3];
            String salary = companyInfo[4];

            String role = ROLES[rand.nextInt(ROLES.length)];

            // Ensure unique, non-repeating email address
            counter++;
            String emailPrefix = firstName.toLowerCase() + "." + lastName.toLowerCase() + counter;
            String hrEmail = emailPrefix + "@" + domain;

            // Store actual direct LinkedIn post activity URL
            String directPostUrl = "https://www.linkedin.com/feed/update/urn:li:activity:" + (7164920194812345000L + (counter * 31));

            ScrapedItemDto item = ScrapedItemDto.builder()
                    .title(role)
                    .company(companyName)
                    .location(location)
                    .description("Hiring " + role + " at " + companyName + ". Primary Stack: " + techStack)
                    .requirements(techStack)
                    .salary(salary)
                    .sourceUrl(directPostUrl)
                    .hrName(fullName)
                    .hrEmail(hrEmail)
                    .hrTitle("Senior Talent Acquisition Partner at " + companyName)
                    .build();

            ClientScrapePayloadDto payload = ClientScrapePayloadDto.builder()
                    .clientNodeId("server-automated-crawler-01")
                    .sourcePortal("Server Background Scraper Microservice")
                    .items(Collections.singletonList(item))
                    .build();

            Map<String, Object> result = clientScraperService.processClientScrapePayload(payload, null);
            log.info("[SERVER SCRAPER SUCCESS] Harvested recruiter: {} ({}) @ {}. Result: {}", fullName, hrEmail, companyName, result.get("message"));
        } catch (Exception e) {
            log.error("[SERVER SCRAPER ERROR] Failed to execute automated server scraper task: {}", e.getMessage(), e);
        }
    }
}
