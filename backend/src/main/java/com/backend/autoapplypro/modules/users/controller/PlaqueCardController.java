package com.backend.autoapplypro.modules.users.controller;

import com.backend.autoapplypro.modules.users.dto.PlaqueCardContactRequest;
import com.backend.autoapplypro.modules.users.dto.PlaqueCardDto;
import com.backend.autoapplypro.modules.users.service.PlaqueCardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@Slf4j
public class PlaqueCardController {

    private final PlaqueCardService plaqueCardService;

    // CANDIDATE AUTHENTICATED ENDPOINTS
    @GetMapping("/api/v1/plaque-card/my-card")
    public ResponseEntity<PlaqueCardDto> getMyPlaqueCard(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = (Long) authentication.getCredentials();
        try {
            PlaqueCardDto dto = plaqueCardService.getPlaqueCardByUserId(userId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @PutMapping("/api/v1/plaque-card/my-card")
    public ResponseEntity<PlaqueCardDto> updateMyPlaqueCard(
            Authentication authentication,
            @RequestBody PlaqueCardDto dto) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = (Long) authentication.getCredentials();
        try {
            PlaqueCardDto updated = plaqueCardService.updatePlaqueCard(userId, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    // ANONYMOUS PUBLIC ENDPOINTS
    @GetMapping("/api/v1/public/plaque-card/{username}")
    public ResponseEntity<com.backend.autoapplypro.modules.users.dto.PublicPlaqueCardResponse> getPublicPlaqueCard(@PathVariable String username) {
        try {
            com.backend.autoapplypro.modules.users.dto.PublicPlaqueCardResponse response = plaqueCardService.getPublicPlaqueCardByUsername(username);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Plaque card profile not found.");
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/api/v1/public/plaque-card/{username}/contact")
    public ResponseEntity<?> submitRecruiterContact(
            @PathVariable String username,
            @RequestBody PlaqueCardContactRequest request) {
        try {
            plaqueCardService.sendContactEmail(username, request);
            return ResponseEntity.ok(Map.of("message", "Message sent successfully to the candidate."));
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found.");
        } catch (IllegalStateException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
