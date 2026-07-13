package com.backend.autoapplypro.modules.outreach.controller;

import com.backend.autoapplypro.modules.outreach.dto.TemplateRatingRequest;
import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.model.TemplateRating;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import com.backend.autoapplypro.modules.outreach.repository.TemplateRatingRepository;
import com.backend.autoapplypro.modules.outreach.service.TemplateLimitValidator;
import com.backend.autoapplypro.modules.outreach.service.TemplateSecurityService;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.outreach.model.TemplateFavorite;
import com.backend.autoapplypro.modules.outreach.repository.TemplateFavoriteRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@Slf4j
public class EmailTemplateController {

    private final EmailTemplateRepository templateRepository;
    private final TemplateRatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final TemplateLimitValidator templateLimitValidator;
    private final TemplateSecurityService templateSecurityService;
    private final TemplateFavoriteRepository favoriteRepository;

    @PostConstruct
    public void seedDefaultTemplates() {
        log.info("Checking for default email templates in database...");
        if (!templateRepository.existsById("default-1")) {
            EmailTemplate default1 = EmailTemplate.builder()
                    .id("default-1")
                    .name("General Application Outreach")
                    .subject("Application for {{jobRole}} | {{hrName}}")
                    .body("Hi {{hrName}},<br/><br/>I hope you are doing well.<br/><br/>I am reaching out to express my interest in the <strong>{{jobRole}}</strong> position at <strong>{{companyName}}</strong>. Having worked with frontend systems, I believe my background aligns well with your team's current expansion goals.<br/><br/>Please find my profile details attached. I would love to connect and discuss how I can add value to {{companyName}}.<br/><br/>Best regards,<br/>Candidate User")
                    .isSystemTemplate(true)
                    .isPublic(true)
                    .build();
            templateRepository.save(default1);
            log.info("Seeded default-1 template.");
        } else {
            templateRepository.findById("default-1").ifPresent(t -> {
                if (!Boolean.TRUE.equals(t.getIsSystemTemplate()) || !Boolean.TRUE.equals(t.getIsPublic()) || t.getCreatorId() != null) {
                    t.setIsSystemTemplate(true);
                    t.setIsPublic(true);
                    t.setCreatorId(null);
                    templateRepository.save(t);
                    log.info("Migrated default-1 template schema fields.");
                }
            });
        }

        if (!templateRepository.existsById("default-2")) {
            EmailTemplate default2 = EmailTemplate.builder()
                    .id("default-2")
                    .name("Quick Follow-Up Template")
                    .subject("Follow up: {{jobRole}} application - {{companyName}}")
                    .body("Hi {{hrName}},<br/><br/>Hope your week is going well.<br/><br/>I wanted to quickly check in on my application for the <strong>{{jobRole}}</strong> role. I remain very excited about the opportunity to join <strong>{{companyName}}</strong> and would love to share more about my experience.<br/><br/>Looking forward to hearing from you.<br/><br/>Best,<br/>Candidate User")
                    .isSystemTemplate(true)
                    .isPublic(true)
                    .build();
            templateRepository.save(default2);
            log.info("Seeded default-2 template.");
        } else {
            templateRepository.findById("default-2").ifPresent(t -> {
                if (!Boolean.TRUE.equals(t.getIsSystemTemplate()) || !Boolean.TRUE.equals(t.getIsPublic()) || t.getCreatorId() != null) {
                    t.setIsSystemTemplate(true);
                    t.setIsPublic(true);
                    t.setCreatorId(null);
                    templateRepository.save(t);
                    log.info("Migrated default-2 template schema fields.");
                }
            });
        }
    }

    @GetMapping
    public ResponseEntity<List<EmailTemplate>> getAllTemplates(
            @RequestParam(required = false) String sortBy,
            Authentication authentication) {
        log.info("Fetching templates (sortBy={})...", sortBy);

        Long userId = -1L;
        boolean isAdmin = false;

        if (authentication != null && authentication.isAuthenticated()) {
            userId = (Long) authentication.getCredentials();
            isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        }

        Sort sort = Sort.unsorted();
        if ("rating".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "averageRating");
        }

        List<EmailTemplate> templates;
        if (isAdmin) {
            templates = templateRepository.findAll(sort);
        } else {
            templates = templateRepository.findAllVisibleTemplates(userId, sort);
        }

        // Populate rating/favorite transient fields for current authenticated user
        if (authentication != null && authentication.isAuthenticated()) {
            final Long currentUserId = (Long) authentication.getCredentials();

            java.util.Set<String> favoriteTemplateIds = favoriteRepository.findByUserId(currentUserId).stream()
                    .map(TemplateFavorite::getTemplateId)
                    .collect(java.util.stream.Collectors.toSet());

            java.util.Map<String, Integer> userRatingsMap = ratingRepository.findByUserId(currentUserId).stream()
                    .collect(java.util.stream.Collectors.toMap(
                            TemplateRating::getTemplateId,
                            TemplateRating::getRating,
                            (r1, r2) -> r1
                    ));

            for (EmailTemplate template : templates) {
                template.setIsFavorited(favoriteTemplateIds.contains(template.getId()));
                template.setUserRating(userRatingsMap.get(template.getId()));
            }
        }

        return ResponseEntity.ok(templates);
    }

    @PostMapping
    public ResponseEntity<EmailTemplate> saveTemplate(
            @RequestBody EmailTemplate template,
            Authentication authentication) {
        log.info("Saving template: {}", template.getName());

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = (Long) authentication.getCredentials();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // If template already exists, perform modify checks
        if (template.getId() != null && templateRepository.existsById(template.getId())) {
            if (!templateSecurityService.canModify(template.getId(), authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        // Validate limits and settings (free user restrictions)
        templateLimitValidator.validateTemplateSave(user, template);

        // Enforce role/ownership constraints
        if (user.getRole() != UserRole.ADMIN) {
            template.setIsSystemTemplate(false);
            template.setCreatorId(userId);
        } else {
            if (template.getCreatorId() == null) {
                template.setCreatorId(userId);
            }
        }

        if (template.getId() == null || template.getId().trim().isEmpty()) {
            template.setId("tpl-" + System.currentTimeMillis());
        }

        EmailTemplate saved = templateRepository.save(template);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@templateSecurity.canModify(#id, authentication)")
    public ResponseEntity<EmailTemplate> updateTemplate(
            @PathVariable String id,
            @RequestBody EmailTemplate templateDetails,
            Authentication authentication) {
        log.info("Updating template ID: {}", id);

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = (Long) authentication.getCredentials();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        EmailTemplate existing = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));

        // Validate limits & settings for the updated values (specifically isPublic status)
        templateLimitValidator.validateTemplateSave(user, templateDetails);

        existing.setName(templateDetails.getName());
        existing.setSubject(templateDetails.getSubject());
        existing.setBody(templateDetails.getBody());
        existing.setIsPublic(templateDetails.getIsPublic());

        if (user.getRole() == UserRole.ADMIN) {
            if (templateDetails.getIsSystemTemplate() != null) {
                existing.setIsSystemTemplate(templateDetails.getIsSystemTemplate());
            }
            if (templateDetails.getCreatorId() != null) {
                existing.setCreatorId(templateDetails.getCreatorId());
            }
        }

        EmailTemplate updated = templateRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@templateSecurity.canDelete(#id, authentication)")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        log.info("Deleting template ID: {}", id);
        if (templateRepository.existsById(id)) {
            templateRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<TemplateRating> rateTemplate(
            @PathVariable String id,
            @RequestBody TemplateRatingRequest request,
            Authentication authentication) {
        log.info("Rating template ID: {}", id);

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = (Long) authentication.getCredentials();
        EmailTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));

        // User can only rate system templates, public templates, or templates they created
        boolean isVisible = Boolean.TRUE.equals(template.getIsSystemTemplate())
                || Boolean.TRUE.equals(template.getIsPublic())
                || userId.equals(template.getCreatorId());

        if (!isVisible) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        TemplateRating rating = ratingRepository.findByTemplateIdAndUserId(id, userId)
                .orElse(TemplateRating.builder()
                        .templateId(id)
                        .userId(userId)
                        .build());

        rating.setRating(request.getRating());
        rating.setComment(request.getComment());

        TemplateRating saved = ratingRepository.save(rating);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Boolean> toggleFavoriteTemplate(
            @PathVariable String id,
            Authentication authentication) {
        log.info("Toggling favorite for template ID: {}", id);

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = (Long) authentication.getCredentials();

        // Check if template exists
        if (!templateRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        Optional<TemplateFavorite> existing = favoriteRepository.findByTemplateIdAndUserId(id, userId);
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return ResponseEntity.ok(false); // Unfavorited
        } else {
            TemplateFavorite favorite = TemplateFavorite.builder()
                    .templateId(id)
                    .userId(userId)
                    .build();
            favoriteRepository.save(favorite);
            return ResponseEntity.ok(true); // Favorited
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument error in template controller: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    // LEGACY RETRIEVAL LOGIC FOR REFERENCE
    // @GetMapping
    // public ResponseEntity<List<EmailTemplate>> getAllTemplates() {
    //     log.info("Fetching all email templates...");
    //     return ResponseEntity.ok(templateRepository.findAll());
    // }

    // LEGACY SAVE LOGIC FOR REFERENCE
    // @PostMapping
    // public ResponseEntity<EmailTemplate> saveTemplate(@RequestBody EmailTemplate template) {
    //     log.info("Saving template: {}", template.getName());
    //     if (template.getId() == null || template.getId().trim().isEmpty()) {
    //         template.setId("tpl-" + System.currentTimeMillis());
    //     }
    //     EmailTemplate saved = templateRepository.save(template);
    //     return ResponseEntity.ok(saved);
    // }

    // LEGACY DELETE LOGIC FOR REFERENCE
    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
    //     log.info("Deleting template ID: {}", id);
    //     if (templateRepository.existsById(id)) {
    //         templateRepository.deleteById(id);
    //         return ResponseEntity.ok().build();
    //     }
    //     return ResponseEntity.notFound().build();
    // }
}
