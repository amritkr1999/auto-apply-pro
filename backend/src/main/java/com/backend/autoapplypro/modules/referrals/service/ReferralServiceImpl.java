package com.backend.autoapplypro.modules.referrals.service;

import com.backend.autoapplypro.modules.outreach.service.EmailSender;
import com.backend.autoapplypro.modules.referrals.dto.ReferralRequestCreateDto;
import com.backend.autoapplypro.modules.referrals.dto.ReferralRequestDto;
import com.backend.autoapplypro.modules.referrals.model.ReferralOutreach;
import com.backend.autoapplypro.modules.referrals.model.ReferralRequest;
import com.backend.autoapplypro.modules.referrals.model.ReferralRequestStatus;
import com.backend.autoapplypro.modules.referrals.repository.ReferralOutreachRepository;
import com.backend.autoapplypro.modules.referrals.repository.ReferralRequestRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReferralServiceImpl implements ReferralService {

    private final ReferralRequestRepository requestRepository;
    private final ReferralOutreachRepository outreachRepository;
    private final UserRepository userRepository;
    private final EmailSender emailSender;

    @org.springframework.beans.factory.annotation.Value("${pipeline.service.url:http://localhost:8000}")
    private String pythonServiceUrl;

    @Override
    @Transactional
    public ReferralRequestDto createRequest(Long userId, ReferralRequestCreateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String domain = extractDomainFromUrl(dto.getJobLink());

        ReferralRequest request = ReferralRequest.builder()
                .user(user)
                .companyName(dto.getCompanyName())
                .companyDomain(domain)
                .jobId(dto.getJobId())
                .jobLink(dto.getJobLink())
                .status(ReferralRequestStatus.PENDING)
                .build();

        request = requestRepository.save(request);

        // Process parsing and matchmaking asynchronously
        final Long requestId = request.getId();
        CompletableFuture.runAsync(() -> processOutreach(requestId));

        return mapToDto(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReferralRequestDto> getRequests(Long userId) {
        return requestRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReferralRequestDto getRequest(Long id) {
        ReferralRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Referral request not found"));
        return mapToDto(request);
    }

    private void processOutreach(Long requestId) {
        ReferralRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null) return;

        try {
            log.info("Starting job scraping/parsing for request ID: {} from link: {}", requestId, request.getJobLink());
            
            // Call Python AI Service
            RestTemplate restTemplate = new RestTemplate();
            String requestUrl = pythonServiceUrl + "/parse-job-url";

            Map<String, String> requestBody = Map.of("url", request.getJobLink());
            Map<?, ?> response = restTemplate.postForObject(requestUrl, requestBody, Map.class);

            if (response != null) {
                request.setJobTitle((String) response.get("title"));
                request.setJobDescription((String) response.get("description"));
                request.setExperienceRequired((String) response.get("experience_required"));
                
                List<?> skillsObj = (List<?>) response.get("skills");
                if (skillsObj != null) {
                    List<String> skills = skillsObj.stream().map(Object::toString).collect(Collectors.toList());
                    request.setSkillsRequired(skills);
                }

                request.setStatus(ReferralRequestStatus.SCRAPED);
                requestRepository.save(request);
                log.info("Scraped job details successfully for request ID: {}. Triggering matchmaking.", requestId);

                // Perform matchmaking
                List<User> professionals = userRepository.findAll().stream()
                        .filter(u -> u.getOfficialEmail() != null && !u.getOfficialEmail().trim().isEmpty())
                        .collect(Collectors.toList());

                String targetDomain = request.getCompanyDomain().toLowerCase();
                List<User> matchedProfessionals = new ArrayList<>();

                for (User prof : professionals) {
                    String profDomain = extractDomainFromEmail(prof.getOfficialEmail());
                    if (!profDomain.isEmpty() && (targetDomain.endsWith(profDomain) || profDomain.endsWith(targetDomain))) {
                        matchedProfessionals.add(prof);
                    }
                }

                log.info("Matched {} professionals at domain: {}", matchedProfessionals.size(), targetDomain);

                // Send outreach emails
                for (User prof : matchedProfessionals) {
                    try {
                        String emailSubject = String.format("Referral Request: %s for %s at %s", 
                                request.getUser().getName(), request.getJobTitle(), request.getCompanyName());
                        
                        String emailBody = String.format(
                                "<html><body>" +
                                "<h3>Hello %s,</h3>" +
                                "<p><strong>%s</strong>, a candidate in your network, is interested in the <strong>%s</strong> role (Job ID: %s) at <strong>%s</strong>.</p>" +
                                "<p>They have matching skills and have shared their profile for a potential referral.</p>" +
                                "<p>Please find the job listing here: <a href='%s'>View Job Listing</a></p>" +
                                "<p>To view their profile and attached resume, please log in to your dashboard.</p>" +
                                "<br/><p>Best regards,<br/>Auto Apply Pro Team</p>" +
                                "</body></html>",
                                prof.getName(), request.getUser().getName(), request.getJobTitle(), request.getJobId(), request.getCompanyName(), request.getJobLink()
                        );

                        emailSender.sendEmail(request.getUser().getId(), prof.getOfficialEmail(), emailSubject, emailBody);

                        ReferralOutreach outreach = ReferralOutreach.builder()
                                .referralRequest(request)
                                .recipient(prof)
                                .status("SENT")
                                .sentAt(LocalDateTime.now())
                                .build();
                        outreachRepository.save(outreach);
                        
                    } catch (Exception mailEx) {
                        log.error("Failed to send referral outreach email to professional: {}", prof.getOfficialEmail(), mailEx);
                    }
                }

                request.setStatus(ReferralRequestStatus.COMPLETED);
                requestRepository.save(request);

            } else {
                throw new RuntimeException("Empty response from Python parser service");
            }

        } catch (Exception e) {
            log.error("Error processing referral request ID: {}", requestId, e);
            request.setStatus(ReferralRequestStatus.SCRAPING_FAILED);
            requestRepository.save(request);
        }
    }

    private String extractDomainFromUrl(String urlString) {
        if (urlString == null || urlString.trim().isEmpty()) {
            return "";
        }
        try {
            URI uri = new URI(urlString);
            String host = uri.getHost();
            if (host == null) {
                return "";
            }
            host = host.toLowerCase();
            if (host.startsWith("www.")) {
                host = host.substring(4);
            }
            return host;
        } catch (Exception e) {
            return "";
        }
    }

    private String extractDomainFromEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "";
        }
        return email.substring(email.indexOf("@") + 1).trim().toLowerCase();
    }

    private ReferralRequestDto mapToDto(ReferralRequest request) {
        long count = outreachRepository.countByReferralRequestId(request.getId());
        return ReferralRequestDto.builder()
                .id(request.getId())
                .userId(request.getUser().getId())
                .companyName(request.getCompanyName())
                .companyDomain(request.getCompanyDomain())
                .jobId(request.getJobId())
                .jobLink(request.getJobLink())
                .jobTitle(request.getJobTitle())
                .jobDescription(request.getJobDescription())
                .skillsRequired(request.getSkillsRequired())
                .experienceRequired(request.getExperienceRequired())
                .status(request.getStatus().name())
                .matchedProfessionals(count)
                .createdAt(request.getCreatedAt())
                .build();
    }
}
