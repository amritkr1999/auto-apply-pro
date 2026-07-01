package com.backend.autoapplypro.modules.users.controller;

import com.backend.autoapplypro.modules.users.model.Candidate;
import com.backend.autoapplypro.modules.users.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SocialOAuthController {

    private final CandidateRepository candidateRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${github.client.id:dev-github-client-id}")
    private String githubClientId;

    @Value("${github.client.secret:dev-github-client-secret}")
    private String githubClientSecret;

    @Value("${linkedin.client.id:dev-linkedin-client-id}")
    private String linkedinClientId;

    @Value("${linkedin.client.secret:dev-linkedin-client-secret}")
    private String linkedinClientSecret;

    private static final String CALLBACK_URL_GITHUB = "http://localhost:8060/api/v1/auth/callback/github";
    private static final String CALLBACK_URL_LINKEDIN = "http://localhost:8060/api/v1/auth/callback/linkedin";

    /**
     * Connect GitHub
     */
    @GetMapping("/connect/github")
    public ResponseEntity<String> connectGithub(@RequestParam("userId") Long userId) {
        log.info("Connecting GitHub for user: {}", userId);
        if (githubClientId.startsWith("dev-")) {
            log.info("Using mock GitHub connection URL for development");
            String mockUrl = CALLBACK_URL_GITHUB + "?code=mock_github_code&state=" + userId;
            return ResponseEntity.ok(mockUrl);
        }
        String authUrl = "https://github.com/login/oauth/authorize?client_id=" + githubClientId
                + "&redirect_uri=" + CALLBACK_URL_GITHUB
                + "&state=" + userId
                + "&scope=user";
        return ResponseEntity.ok(authUrl);
    }

    /**
     * GitHub Callback
     */
    @GetMapping("/callback/github")
    @Transactional
    public RedirectView githubCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        Long userId = Long.parseLong(state);
        log.info("Received GitHub callback for user: {}", userId);

        try {
            String githubUsername;
            String githubProfileUrl;

            if ("mock_github_code".equals(code)) {
                githubUsername = "mock-developer";
                githubProfileUrl = "https://github.com/mock-developer";
            } else {
                // Exchange code for token
                HttpHeaders headers = new HttpHeaders();
                headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
                Map<String, String> request = new HashMap<>();
                request.put("client_id", githubClientId);
                request.put("client_secret", githubClientSecret);
                request.put("code", code);
                request.put("redirect_uri", CALLBACK_URL_GITHUB);

                HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(
                        "https://github.com/login/oauth/access_token",
                        entity,
                        Map.class
                );

                Map<String, Object> body = response.getBody();
                if (body == null || !body.containsKey("access_token")) {
                    throw new IllegalStateException("Failed to retrieve access token from GitHub");
                }
                String accessToken = (String) body.get("access_token");

                // Fetch Profile details
                HttpHeaders userHeaders = new HttpHeaders();
                userHeaders.set("Authorization", "Bearer " + accessToken);
                HttpEntity<String> userEntity = new HttpEntity<>(userHeaders);

                ResponseEntity<Map> userResponse = restTemplate.exchange(
                        "https://api.github.com/user",
                        HttpMethod.GET,
                        userEntity,
                        Map.class
                );

                Map<String, Object> userBody = userResponse.getBody();
                if (userBody == null) {
                    throw new IllegalStateException("Failed to retrieve user profile from GitHub");
                }
                githubUsername = (String) userBody.get("login");
                githubProfileUrl = (String) userBody.get("html_url");
            }

            // Save to database
            Candidate candidate = candidateRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));
            candidate.setGithubUsername(githubUsername);
            candidate.setGithubProfileUrl(githubProfileUrl);
            candidateRepository.save(candidate);

            return new RedirectView("http://localhost:5173/candidate/profile?status=success&provider=github");

        } catch (Exception e) {
            log.error("GitHub OAuth Error for user {}", userId, e);
            String errMsg = e.getMessage() != null ? e.getMessage() : "Unknown Error";
            try {
                errMsg = java.net.URLEncoder.encode(errMsg, "UTF-8");
            } catch (Exception ex) {}
            return new RedirectView("http://localhost:5173/candidate/profile?status=error&provider=github&errorMsg=" + errMsg);
        }
    }

    /**
     * Connect LinkedIn
     */
    @GetMapping("/connect/linkedin")
    public ResponseEntity<String> connectLinkedin(@RequestParam("userId") Long userId) {
        log.info("Connecting LinkedIn for user: {}", userId);
        if (linkedinClientId.startsWith("dev-")) {
            log.info("Using mock LinkedIn connection URL for development");
            String mockUrl = CALLBACK_URL_LINKEDIN + "?code=mock_linkedin_code&state=" + userId;
            return ResponseEntity.ok(mockUrl);
        }
        String authUrl = "https://www.linkedin.com/oauth/v2/authorization?response_type=code"
                + "&client_id=" + linkedinClientId
                + "&redirect_uri=" + CALLBACK_URL_LINKEDIN
                + "&state=" + userId
                + "&scope=openid%20profile%20email";
        return ResponseEntity.ok(authUrl);
    }

    /**
     * LinkedIn Callback
     */
    @GetMapping("/callback/linkedin")
    @Transactional
    public RedirectView linkedinCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        Long userId = Long.parseLong(state);
        log.info("Received LinkedIn callback for user: {}", userId);

        try {
            String linkedinName;
            String linkedinProfileUrl;

            if ("mock_linkedin_code".equals(code)) {
                linkedinName = "Mock Candidate";
                linkedinProfileUrl = "https://www.linkedin.com/in/mock-candidate";
            } else {
                // Exchange code for token
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

                MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
                map.add("grant_type", "authorization_code");
                map.add("code", code);
                map.add("redirect_uri", CALLBACK_URL_LINKEDIN);
                map.add("client_id", linkedinClientId);
                map.add("client_secret", linkedinClientSecret);

                HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(map, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(
                        "https://www.linkedin.com/oauth/v2/accessToken",
                        requestEntity,
                        Map.class
                );

                Map<String, Object> body = response.getBody();
                if (body == null || !body.containsKey("access_token")) {
                    throw new IllegalStateException("Failed to retrieve access token from LinkedIn");
                }
                String accessToken = (String) body.get("access_token");

                // Fetch Profile details via OpenID Connect userinfo
                HttpHeaders userHeaders = new HttpHeaders();
                userHeaders.set("Authorization", "Bearer " + accessToken);
                HttpEntity<String> userEntity = new HttpEntity<>(userHeaders);

                ResponseEntity<Map> userResponse = restTemplate.exchange(
                        "https://api.linkedin.com/v2/userinfo",
                        HttpMethod.GET,
                        userEntity,
                        Map.class
                );

                Map<String, Object> userBody = userResponse.getBody();
                if (userBody == null) {
                    throw new IllegalStateException("Failed to retrieve user profile from LinkedIn");
                }
                linkedinName = (String) userBody.get("name");
                
                // OpenID Connect does not guarantee returning direct profile URL
                // We fallback to constructing a placeholder link or using user ID
                String sub = (String) userBody.get("sub");
                linkedinProfileUrl = "https://www.linkedin.com/in/" + sub;
            }

            // Save to database
            Candidate candidate = candidateRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));
            candidate.setLinkedinName(linkedinName);
            candidate.setLinkedinProfileUrl(linkedinProfileUrl);
            candidateRepository.save(candidate);

            return new RedirectView("http://localhost:5173/candidate/profile?status=success&provider=linkedin");

        } catch (Exception e) {
            log.error("LinkedIn OAuth Error for user {}", userId, e);
            String errMsg = e.getMessage() != null ? e.getMessage() : "Unknown Error";
            try {
                errMsg = java.net.URLEncoder.encode(errMsg, "UTF-8");
            } catch (Exception ex) {}
            return new RedirectView("http://localhost:5173/candidate/profile?status=error&provider=linkedin&errorMsg=" + errMsg);
        }
    }

    /**
     * Disconnect GitHub
     */
    @PostMapping("/disconnect/github")
    @Transactional
    public ResponseEntity<?> disconnectGithub(@RequestParam("userId") Long userId) {
        log.info("Disconnecting GitHub for user: {}", userId);
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));
        candidate.setGithubUsername(null);
        candidate.setGithubProfileUrl(null);
        candidateRepository.save(candidate);
        return ResponseEntity.ok(Map.of("message", "GitHub disconnected successfully"));
    }

    /**
     * Disconnect LinkedIn
     */
    @PostMapping("/disconnect/linkedin")
    @Transactional
    public ResponseEntity<?> disconnectLinkedin(@RequestParam("userId") Long userId) {
        log.info("Disconnecting LinkedIn for user: {}", userId);
        Candidate candidate = candidateRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate profile not found"));
        candidate.setLinkedinName(null);
        candidate.setLinkedinProfileUrl(null);
        candidateRepository.save(candidate);
        return ResponseEntity.ok(Map.of("message", "LinkedIn disconnected successfully"));
    }
}
