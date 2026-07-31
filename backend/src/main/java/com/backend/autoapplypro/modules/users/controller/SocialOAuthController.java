package com.backend.autoapplypro.modules.users.controller;

import com.backend.autoapplypro.modules.users.model.ProfessionalProfile;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeRequestUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
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
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class SocialOAuthController {

    private final ProfessionalProfileRepository professionalProfileRepository;
    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.backend.autoapplypro.config.JwtUtil jwtUtil;
    private final com.backend.autoapplypro.modules.users.service.MarketingEmailCampaignService marketingCampaignService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${github.client.id:dev-github-client-id}")
    private String githubClientId;

    @Value("${github.client.secret:dev-github-client-secret}")
    private String githubClientSecret;

    @Value("${linkedin.client.id:dev-linkedin-client-id}")
    private String linkedinClientId;

    @Value("${linkedin.client.secret:dev-linkedin-client-secret}")
    private String linkedinClientSecret;

    @Value("${spring.security.oauth2.client.registration.google.client-id:dev-client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:dev-client-secret}")
    private String googleClientSecret;

    @Value("${google.oauth2.redirect-uri:http://localhost:8060/api/v1/outreach/oauth2/callback}")
    private String googleRedirectUri;

    @Value("${github.oauth2.redirect-uri:http://localhost:8060/api/v1/auth/callback/github}")
    private String githubRedirectUri;

    @Value("${linkedin.oauth2.redirect-uri:http://localhost:8060/api/v1/auth/callback/linkedin}")
    private String linkedinRedirectUri;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Google Login
     */
    @GetMapping("/login/google")
    public ResponseEntity<String> loginGoogle() {
        log.info("Generating Google OAuth login URL");
        if (googleClientId.startsWith("dev-")) {
            log.info("Using mock Google connection URL for development");
            String mockUrl = googleRedirectUri + "?code=mock_google_code&state=login";
            return ResponseEntity.ok(mockUrl);
        }
        String authUrl = new GoogleAuthorizationCodeRequestUrl(
                "https://accounts.google.com/o/oauth2/v2/auth",
                googleClientId,
                googleRedirectUri,
                Arrays.asList("email", "profile", "openid")
        )
        .setState("login")
        .build();
        return ResponseEntity.ok(authUrl);
    }

    /**
     * GitHub Login
     */
    @GetMapping("/login/github")
    public ResponseEntity<String> loginGithub() {
        log.info("Generating GitHub OAuth login URL");
        if (githubClientId.startsWith("dev-")) {
            log.info("Using mock GitHub connection URL for development");
            String mockUrl = githubRedirectUri + "?code=mock_github_code&state=login";
            return ResponseEntity.ok(mockUrl);
        }
        String authUrl = "https://github.com/login/oauth/authorize?client_id=" + githubClientId
                + "&redirect_uri=" + githubRedirectUri
                + "&state=login"
                + "&scope=user";
        return ResponseEntity.ok(authUrl);
    }

    /**
     * Connect GitHub
     */
    @GetMapping("/connect/github")
    public ResponseEntity<String> connectGithub(@RequestParam("userId") Long userId) {
        log.info("Connecting GitHub for user: {}", userId);
        if (githubClientId.startsWith("dev-")) {
            log.info("Using mock GitHub connection URL for development");
            String mockUrl = githubRedirectUri + "?code=mock_github_code&state=" + userId;
            return ResponseEntity.ok(mockUrl);
        }
        String authUrl = "https://github.com/login/oauth/authorize?client_id=" + githubClientId
                + "&redirect_uri=" + githubRedirectUri
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
        boolean isLogin = false;
        Long userId = null;
        try {
            userId = Long.parseLong(state);
        } catch (NumberFormatException e) {
            isLogin = true;
        }
        log.info("Received GitHub callback. state: {}, isLogin: {}", state, isLogin);

        try {
            String githubUsername;
            String githubProfileUrl;
            String email = null;

            if ("mock_github_code".equals(code)) {
                githubUsername = "mock-developer";
                githubProfileUrl = "https://github.com/mock-developer";
                email = "social.github@example.com";
            } else {
                // Exchange code for token
                HttpHeaders headers = new HttpHeaders();
                headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
                Map<String, String> request = new HashMap<>();
                request.put("client_id", githubClientId);
                request.put("client_secret", githubClientSecret);
                request.put("code", code);
                request.put("redirect_uri", githubRedirectUri);

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
                email = (String) userBody.get("email");

                if (isLogin && (email == null || email.isEmpty())) {
                    // Fetch emails from /user/emails
                    try {
                        HttpHeaders emailHeaders = new HttpHeaders();
                        emailHeaders.set("Authorization", "Bearer " + accessToken);
                        HttpEntity<String> emailEntity = new HttpEntity<>(emailHeaders);
                        ResponseEntity<java.util.List> emailsResponse = restTemplate.exchange(
                                "https://api.github.com/user/emails",
                                HttpMethod.GET,
                                emailEntity,
                                java.util.List.class
                        );
                        java.util.List<Map<String, Object>> emailsList = emailsResponse.getBody();
                        if (emailsList != null) {
                            for (Map<String, Object> emailObj : emailsList) {
                                Boolean primary = (Boolean) emailObj.get("primary");
                                Boolean verified = (Boolean) emailObj.get("verified");
                                if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified)) {
                                    email = (String) emailObj.get("email");
                                    break;
                                }
                            }
                        }
                    } catch (Exception ex) {
                        log.error("Failed to fetch email list from GitHub", ex);
                    }
                }
            }

            if (isLogin) {
                if (email == null || email.isEmpty()) {
                    email = (githubUsername != null ? githubUsername : "github-user") + "@github.com";
                }
                User user = userRepository.findByEmail(email).orElse(null);
                if (user == null) {
                    String randomPassword = java.util.UUID.randomUUID().toString();
                    user = User.builder()
                            .email(email)
                            .passwordHash(passwordEncoder.encode(randomPassword))
                            .role(UserRole.CANDIDATE)
                            .name(githubUsername != null ? githubUsername : "GitHub User")
                            .mobile("1234567890")
                            .loginStreak(1)
                            .lastLoginDate(java.time.LocalDate.now())
                            .isEmailVerified(true)
                            .build();
                    user = userRepository.save(user);
                    marketingCampaignService.sendWelcomeEmail(user);

                    ProfessionalProfile candidate = ProfessionalProfile.builder()
                            .user(user)
                            .githubUsername(githubUsername)
                            .githubProfileUrl(githubProfileUrl)
                            .isVerified(true)
                            .skills(new java.util.HashSet<>())
                            .jobPreferences(new java.util.HashMap<>())
                            .build();
                    professionalProfileRepository.save(candidate);
                } else {
                    if (user.getRole() == UserRole.CANDIDATE) {
                        ProfessionalProfile candidate = professionalProfileRepository.findByUserId(user.getId()).orElse(null);
                        if (candidate != null) {
                            if (candidate.getGithubUsername() == null) {
                                candidate.setGithubUsername(githubUsername);
                                candidate.setGithubProfileUrl(githubProfileUrl);
                                candidate.setIsVerified(true);
                                professionalProfileRepository.save(candidate);
                            }
                        }
                    }
                }

                String jwtToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
                String targetUrl = String.format("%s/login?token=%s&id=%d&email=%s&name=%s&role=%s&loginStreak=%d&mobile=%s",
                        frontendUrl,
                        jwtToken,
                        user.getId(),
                        java.net.URLEncoder.encode(user.getEmail(), "UTF-8"),
                        java.net.URLEncoder.encode(user.getName(), "UTF-8"),
                        user.getRole().name(),
                        user.getLoginStreak(),
                        user.getMobile() != null ? java.net.URLEncoder.encode(user.getMobile(), "UTF-8") : ""
                );
                return new RedirectView(targetUrl);
            } else {
                ProfessionalProfile candidate = professionalProfileRepository.findByUserId(userId)
                        .orElseThrow(() -> new IllegalArgumentException("Professional profile not found"));
                candidate.setGithubUsername(githubUsername);
                candidate.setGithubProfileUrl(githubProfileUrl);
                candidate.setIsVerified(true);
                professionalProfileRepository.save(candidate);

                return new RedirectView(frontendUrl + "/profile/settings?status=success&provider=github");
            }

        } catch (Exception e) {
            log.error("GitHub OAuth Error for state {}", state, e);
            String errMsg = e.getMessage() != null ? e.getMessage() : "Unknown Error";
            try {
                errMsg = java.net.URLEncoder.encode(errMsg, "UTF-8");
            } catch (Exception ex) {}
            if (isLogin) {
                return new RedirectView(frontendUrl + "/login?status=error&errorMsg=" + errMsg);
            } else {
                return new RedirectView(frontendUrl + "/profile/settings?status=error&provider=github&errorMsg=" + errMsg);
            }
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
            String mockUrl = linkedinRedirectUri + "?code=mock_linkedin_code&state=" + userId;
            return ResponseEntity.ok(mockUrl);
        }
        String authUrl = "https://www.linkedin.com/oauth/v2/authorization?response_type=code"
                + "&client_id=" + linkedinClientId
                + "&redirect_uri=" + linkedinRedirectUri
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
                map.add("redirect_uri", linkedinRedirectUri);
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
            ProfessionalProfile candidate = professionalProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Professional profile not found"));
            candidate.setLinkedinName(linkedinName);
            candidate.setLinkedinProfileUrl(linkedinProfileUrl);
            professionalProfileRepository.save(candidate);

            return new RedirectView(frontendUrl + "/profile/settings?status=success&provider=linkedin");

        } catch (Exception e) {
            log.error("LinkedIn OAuth Error for user {}", userId, e);
            String errMsg = e.getMessage() != null ? e.getMessage() : "Unknown Error";
            try {
                errMsg = java.net.URLEncoder.encode(errMsg, "UTF-8");
            } catch (Exception ex) {}
            return new RedirectView(frontendUrl + "/profile/settings?status=error&provider=linkedin&errorMsg=" + errMsg);
        }
    }

    /**
     * Disconnect GitHub
     */
    @PostMapping("/disconnect/github")
    @Transactional
    public ResponseEntity<?> disconnectGithub(@RequestParam("userId") Long userId) {
        log.info("Disconnecting GitHub for user: {}", userId);
        ProfessionalProfile candidate = professionalProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Professional profile not found"));
        candidate.setGithubUsername(null);
        candidate.setGithubProfileUrl(null);
        candidate.setIsVerified(false);
        professionalProfileRepository.save(candidate);
        return ResponseEntity.ok(Map.of("message", "GitHub disconnected successfully"));
    }

    /**
     * Disconnect LinkedIn
     */
    @PostMapping("/disconnect/linkedin")
    @Transactional
    public ResponseEntity<?> disconnectLinkedin(@RequestParam("userId") Long userId) {
        log.info("Disconnecting LinkedIn for user: {}", userId);
        ProfessionalProfile candidate = professionalProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Professional profile not found"));
        candidate.setLinkedinName(null);
        candidate.setLinkedinProfileUrl(null);
        professionalProfileRepository.save(candidate);
        return ResponseEntity.ok(Map.of("message", "LinkedIn disconnected successfully"));
    }
}
