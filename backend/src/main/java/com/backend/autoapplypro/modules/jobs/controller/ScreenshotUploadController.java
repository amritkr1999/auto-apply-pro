package com.backend.autoapplypro.modules.jobs.controller;

import com.backend.autoapplypro.modules.jobs.model.ScreenshotUpload;
import com.backend.autoapplypro.modules.jobs.repository.ScreenshotUploadRepository;
import com.backend.autoapplypro.modules.jobs.service.ScreenshotProcessorService;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/screenshots")
@RequiredArgsConstructor
@Slf4j
public class ScreenshotUploadController {

    private final ScreenshotUploadRepository screenshotRepository;
    private final UserRepository userRepository;
    private final ScreenshotProcessorService processorService;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/png", "image/jpeg", "image/jpg", "image/webp");

    private void validateUpload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 5MB limit: " + file.getOriginalFilename());
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only PNG, JPEG, and WEBP images are allowed: " + file.getOriginalFilename());
        }
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadScreenshots(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("userId") Long userId) {
        
        log.info("Received {} screenshots for user: {}", files.length, userId);
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found with ID: " + userId);
        }

        List<Map<String, Object>> responses = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            try {
                validateUpload(file);
            } catch (IllegalArgumentException e) {
                log.warn("File validation failed: {}", e.getMessage());
                return ResponseEntity.badRequest().body(e.getMessage());
            }

            try {
                ScreenshotUpload upload = ScreenshotUpload.builder()
                        .user(user)
                        .fileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "screenshot.png")
                        .fileBytes(file.getBytes())
                        .status("PENDING")
                        .build();

                ScreenshotUpload saved = screenshotRepository.save(upload);

                // Run async processing
                processorService.processScreenshotAsync(saved.getId());

                Map<String, Object> resMap = new HashMap<>();
                resMap.put("id", saved.getId());
                resMap.put("fileName", saved.getFileName());
                resMap.put("status", saved.getStatus());
                responses.add(resMap);

            } catch (IOException e) {
                log.error("Failed to read bytes for file: {}", file.getOriginalFilename(), e);
            }
        }

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUploadsForUser(@PathVariable Long userId) {
        List<ScreenshotUpload> uploads = screenshotRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (ScreenshotUpload u : uploads) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fileName", u.getFileName());
            map.put("status", u.getStatus());
            map.put("errorMessage", u.getErrorMessage());
            map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
            response.add(map);
        }
        
        return ResponseEntity.ok(response);
    }

    @Transactional
    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<?> clearLogs(@PathVariable Long userId) {
        log.info("Clearing screenshot uploads logs for user: {}", userId);
        List<ScreenshotUpload> uploads = screenshotRepository.findByUserId(userId);
        
        for (ScreenshotUpload u : uploads) {
            if ("COMPLETED".equals(u.getStatus()) || "FAILED".equals(u.getStatus())) {
                screenshotRepository.delete(u);
            }
        }
        
        return ResponseEntity.ok(Map.of("message", "Logs cleared successfully"));
    }

    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUpload(@PathVariable Long id) {
        log.info("Deleting screenshot upload log ID: {}", id);
        if (screenshotRepository.existsById(id)) {
            screenshotRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Log entry deleted"));
        }
        return ResponseEntity.notFound().build();
    }
}
