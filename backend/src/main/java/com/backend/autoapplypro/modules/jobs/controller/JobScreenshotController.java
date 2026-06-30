package com.backend.autoapplypro.modules.jobs.controller;

import com.backend.autoapplypro.modules.jobs.dto.JobDetailsDto;
import com.backend.autoapplypro.modules.users.model.Skill;
import com.backend.autoapplypro.modules.users.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class JobScreenshotController {

    private final SkillRepository skillRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PYTHON_SERVICE_URL = "http://localhost:8000/extract-job-details";

    /**
     * Accepts a screenshot image, forwards it to the local Python OCR/AI service,
     * parses the extracted fields, and returns the JobDetailsDto.
     *
     * @param file The uploaded screenshot file.
     * @return JobDetailsDto containing extracted fields or error response.
     */
    @PostMapping(value = "/parse-screenshot", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> parseScreenshot(@RequestParam("file") MultipartFile file) {
        log.info("Received request to parse job screenshot. Filename: {}, Size: {} bytes", 
                file.getOriginalFilename(), file.getSize());

        if (file.isEmpty()) {
            log.warn("Uploaded file is empty.");
            return ResponseEntity.badRequest().body("Uploaded file cannot be empty.");
        }

        try {
            // Set up headers for multipart/form-data
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Wrap file bytes in ByteArrayResource to enable correct file transferring
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "screenshot.png";
                }
            };

            // Build request body
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            log.info("Forwarding screenshot payload to Python extraction service at {}", PYTHON_SERVICE_URL);
            
            // Call Python FastAPI/Flask extraction endpoint
            ResponseEntity<JobDetailsDto> response = restTemplate.postForEntity(
                    PYTHON_SERVICE_URL,
                    requestEntity,
                    JobDetailsDto.class
            );

            log.info("Successfully received response from Python extraction service. Status: {}", response.getStatusCode());
            JobDetailsDto dto = response.getBody();
            if (dto != null) {
                if (dto.getHrEmails() == null || dto.getHrEmails().isEmpty()) {
                    dto.setStatus("INCOMPLETE_DATA");
                } else {
                    dto.setStatus("PARSED");
                }

                if (dto.getSkills() != null) {
                    log.info("Extracted {} skills. Persisting/associating with master skills table...", dto.getSkills().size());
                    for (String skillName : dto.getSkills()) {
                        String trimmedName = skillName.trim();
                        if (!trimmedName.isEmpty()) {
                            skillRepository.findByNameIgnoreCase(trimmedName)
                                .orElseGet(() -> {
                                    Skill newSkill = Skill.builder().name(trimmedName).build();
                                    return skillRepository.save(newSkill);
                                });
                        }
                    }
                }
            }
            return ResponseEntity.ok(dto);

        } catch (ResourceAccessException e) {
            log.error("Failed to connect to the Python service at {}. Is the service running? Error: {}", 
                    PYTHON_SERVICE_URL, e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("The background AI parsing service is currently offline or unreachable. Please try again later.");
        } catch (IOException e) {
            log.error("IOException occurred while reading the uploaded file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error reading the uploaded file. Please ensure it is a valid image.");
        } catch (Exception e) {
            log.error("An unexpected error occurred during screenshot parsing: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while parsing the screenshot: " + e.getMessage());
        }
    }
}
