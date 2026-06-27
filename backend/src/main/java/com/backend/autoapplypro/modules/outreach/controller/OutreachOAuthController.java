package com.backend.autoapplypro.modules.outreach.controller;

import com.backend.autoapplypro.modules.outreach.model.GmailCredential;
import com.backend.autoapplypro.modules.outreach.repository.GmailCredentialRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeRequestUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import java.time.LocalDateTime;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/outreach")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OutreachOAuthController {

    private final GmailCredentialRepository credentialRepository;
    private final UserRepository userRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id:dev-client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:dev-client-secret}")
    private String clientSecret;

    private static final String CALLBACK_URL = "http://localhost:8060/api/v1/outreach/oauth2/callback";
    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

    /**
     * Redirects the user to Google OAuth2 consent screen.
     * Passes the userId as the OAuth state parameter so we can match it in callback.
     *
     * @param userId The ID of the user connecting their Gmail account.
     */
    @GetMapping("/connect/google")
    public ResponseEntity<String> connectGoogle(@RequestParam("userId") Long userId) {
        log.info("Generating Google OAuth redirect URL for user ID: {} with client ID: {}", userId, clientId);
        
        // Build OAuth authorization URL
        String authUrl = new GoogleAuthorizationCodeRequestUrl(
                GOOGLE_AUTH_URL,
                clientId,
                CALLBACK_URL,
                Arrays.asList("https://www.googleapis.com/auth/gmail.send", "email", "openid")
        )
        .setAccessType("offline")
        .setApprovalPrompt("force") // Forces Google to output refresh_token
        .setState(userId.toString())
        .build();

        return ResponseEntity.ok(authUrl);
    }

    /**
     * Handles the Google OAuth2 callback.
     * Exchanges the authorization code for access and refresh tokens,
     * decrypts/extracts the user's email, and saves the credentials encrypted in database.
     */
    @GetMapping("/oauth2/callback")
    public RedirectView oauthCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state) {
        
        Long userId = Long.parseLong(state);
        log.info("Received OAuth callback for user ID: {}", userId);

        try {
            // Exchange code for tokens
            GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    "https://oauth2.googleapis.com/token",
                    clientId,
                    clientSecret,
                    code,
                    CALLBACK_URL
            ).execute();

            String accessToken = tokenResponse.getAccessToken();
            String refreshToken = tokenResponse.getRefreshToken();
            Long expiresIn = tokenResponse.getExpiresInSeconds();
            LocalDateTime expiryTime = LocalDateTime.now().plusSeconds(expiresIn != null ? expiresIn : 3600);

            // Parse ID token to extract email
            String email = tokenResponse.parseIdToken().getPayload().getEmail();
            log.info("Token exchange successful. Connected email: {}", email);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Check if credential already exists or create new
            GmailCredential credential = credentialRepository.findByUserId(userId)
                    .orElse(GmailCredential.builder().user(user).build());

            credential.setAccessToken(accessToken);
            if (refreshToken != null) {
                credential.setRefreshToken(refreshToken);
            }
            credential.setTokenExpiry(expiryTime);
            credential.setConnectedEmail(email);

            credentialRepository.save(credential);
            log.info("OAuth credentials securely saved for user ID: {}", userId);

            // Redirect back to frontend profile page
            return new RedirectView("http://localhost:5173/candidate/profile?status=success");

        } catch (Exception e) {
            log.error("Error exchanging OAuth code for user ID: {}", userId, e);
            return new RedirectView("http://localhost:5173/candidate/profile?status=error");
        }
    }

    /**
     * Retrieves the Gmail connection status for a user.
     */
    @GetMapping("/status")
    public ResponseEntity<?> getGmailStatus(@RequestParam("userId") Long userId) {
        log.info("Checking Gmail connection status for user ID: {}", userId);
        java.util.Optional<GmailCredential> credOpt = credentialRepository.findByUserId(userId);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        if (credOpt.isPresent()) {
            response.put("connected", true);
            response.put("connectedEmail", credOpt.get().getConnectedEmail());
        } else {
            response.put("connected", false);
            response.put("connectedEmail", null);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Disconnects a user's connected Gmail account.
     */
    @PostMapping("/disconnect")
    public ResponseEntity<?> disconnectGmail(@RequestParam("userId") Long userId) {
        log.info("Disconnecting Gmail for user ID: {}", userId);
        java.util.Optional<GmailCredential> credOpt = credentialRepository.findByUserId(userId);
        if (credOpt.isPresent()) {
            credentialRepository.delete(credOpt.get());
            log.info("Gmail disconnected successfully for user ID: {}", userId);
            return ResponseEntity.ok(java.util.Map.of("message", "Gmail disconnected successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(java.util.Map.of("error", "Gmail connection not found"));
    }
}
