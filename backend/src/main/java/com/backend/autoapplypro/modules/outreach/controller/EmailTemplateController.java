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
                    .intro("Dear {{recruiterName}},")
                    .skillsTemplate("I am writing to apply for the {{jobRole}} position. I noticed your team is looking for a developer experienced in {{skills}}, which maps closely to my skillset.")
                    .body("I am reaching out to express my interest in the <strong>{{jobRole}}</strong> position at <strong>{{companyName}}</strong>. Having worked with frontend systems, I believe my background aligns well with your team's current expansion goals.<br/><br/>Please find my profile details attached. I would love to connect and discuss how I can add value to {{companyName}}.")
                    .signOff("Regards,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}")
                    .isSystemTemplate(true)
                    .isPublic(true)
                    .build();
            templateRepository.save(default1);
            log.info("Seeded default-1 template.");
        } else {
            templateRepository.findById("default-1").ifPresent(t -> {
                boolean updated = false;
                if (!Boolean.TRUE.equals(t.getIsSystemTemplate()) || !Boolean.TRUE.equals(t.getIsPublic()) || t.getCreatorId() != null) {
                    t.setIsSystemTemplate(true);
                    t.setIsPublic(true);
                    t.setCreatorId(null);
                    updated = true;
                }
                if (t.getIntro() == null || t.getIntro().trim().isEmpty()) {
                    t.setIntro("Dear {{recruiterName}},");
                    updated = true;
                }
                if (t.getSkillsTemplate() == null || t.getSkillsTemplate().trim().isEmpty()) {
                    t.setSkillsTemplate("I am writing to apply for the {{jobRole}} position. I noticed your team is looking for a developer experienced in {{skills}}, which maps closely to my skillset.");
                    updated = true;
                }
                if (t.getBody() == null || t.getBody().contains("Candidate User") || t.getBody().contains("Hi {{hrName}}")) {
                    t.setBody("I am reaching out to express my interest in the <strong>{{jobRole}}</strong> position at <strong>{{companyName}}</strong>. Having worked with frontend systems, I believe my background aligns well with your team's current expansion goals.<br/><br/>Please find my profile details attached. I would love to connect and discuss how I can add value to {{companyName}}.");
                    updated = true;
                }
                if (t.getSignOff() == null || t.getSignOff().trim().isEmpty()) {
                    t.setSignOff("Regards,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}");
                    updated = true;
                }
                if (updated) {
                    templateRepository.save(t);
                    log.info("Updated default-1 template with missing fields.");
                }
            });
        }

        if (!templateRepository.existsById("default-2")) {
            EmailTemplate default2 = EmailTemplate.builder()
                    .id("default-2")
                    .name("Quick Follow-Up Template")
                    .subject("Follow up: {{jobRole}} application - {{companyName}}")
                    .intro("Hi {{recruiterName}},")
                    .skillsTemplate("I wanted to follow up on my application for the {{jobRole}} role. My hands-on skills in {{skills}} make me excited about joining {{companyName}}.")
                    .body("I wanted to quickly check in on my application for the <strong>{{jobRole}}</strong> role. I remain very excited about the opportunity to join <strong>{{companyName}}</strong> and would love to share more about my experience.<br/><br/>Looking forward to hearing from you.")
                    .signOff("Regards,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}")
                    .isSystemTemplate(true)
                    .isPublic(true)
                    .build();
            templateRepository.save(default2);
            log.info("Seeded default-2 template.");
        } else {
            templateRepository.findById("default-2").ifPresent(t -> {
                boolean updated = false;
                if (!Boolean.TRUE.equals(t.getIsSystemTemplate()) || !Boolean.TRUE.equals(t.getIsPublic()) || t.getCreatorId() != null) {
                    t.setIsSystemTemplate(true);
                    t.setIsPublic(true);
                    t.setCreatorId(null);
                    updated = true;
                }
                if (t.getIntro() == null || t.getIntro().trim().isEmpty()) {
                    t.setIntro("Hi {{recruiterName}},");
                    updated = true;
                }
                if (t.getSkillsTemplate() == null || t.getSkillsTemplate().trim().isEmpty()) {
                    t.setSkillsTemplate("I wanted to follow up on my application for the {{jobRole}} role. My hands-on skills in {{skills}} make me excited about joining {{companyName}}.");
                    updated = true;
                }
                if (t.getBody() == null || t.getBody().contains("Candidate User") || t.getBody().contains("Hi {{hrName}}")) {
                    t.setBody("I wanted to quickly check in on my application for the <strong>{{jobRole}}</strong> role. I remain very excited about the opportunity to join <strong>{{companyName}}</strong> and would love to share more about my experience.<br/><br/>Looking forward to hearing from you.");
                    updated = true;
                }
                if (t.getSignOff() == null || t.getSignOff().trim().isEmpty()) {
                    t.setSignOff("Regards,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}");
                    updated = true;
                }
                if (updated) {
                    templateRepository.save(t);
                    log.info("Updated default-2 template with missing fields.");
                }
            });
        }

        if (!templateRepository.existsById("default-3")) {
            EmailTemplate default3 = EmailTemplate.builder()
                    .id("default-3")
                    .name("Referral Request")
                    .subject("Connecting regarding open roles at {{companyName}}")
                    .intro("Dear {{recruiterName}},")
                    .skillsTemplate("I noticed that {{companyName}} is expanding and looking for developers skilled in {{skills}}. I wanted to connect to see if my background might be a fit.")
                    .body("I have {{experienceYears}} years of software engineering experience building highly scalable applications and products. I would be grateful for a referral or any advice you might have on applying.")
                    .signOff("Best regards,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}")
                    .isSystemTemplate(true)
                    .isPublic(true)
                    .build();
            templateRepository.save(default3);
            log.info("Seeded default-3 template.");
        } else {
            templateRepository.findById("default-3").ifPresent(t -> {
                if (!Boolean.TRUE.equals(t.getIsSystemTemplate()) || !Boolean.TRUE.equals(t.getIsPublic()) || t.getCreatorId() != null) {
                    t.setIsSystemTemplate(true);
                    t.setIsPublic(true);
                    t.setCreatorId(null);
                    templateRepository.save(t);
                    log.info("Migrated default-3 template schema fields.");
                }
            });
        }

        if (!templateRepository.existsById("default-4")) {
            EmailTemplate default4 = EmailTemplate.builder()
                    .id("default-4")
                    .name("Networking & Informational Interview")
                    .subject("Inquiry: Engineering team growth at {{companyName}}")
                    .intro("Hi {{recruiterName}},")
                    .skillsTemplate("I've been following {{companyName}}'s growth and was particularly interested in your work requiring {{skills}}.")
                    .body("With {{experienceYears}} years of software development experience, I’m keen to learn more about the team culture, recent challenges, and future direction. Would you be open to a brief 10-minute informational chat sometime next week?")
                    .signOff("Sincerely,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}")
                    .isSystemTemplate(true)
                    .isPublic(true)
                    .build();
            templateRepository.save(default4);
            log.info("Seeded default-4 template.");
        } else {
            templateRepository.findById("default-4").ifPresent(t -> {
                if (!Boolean.TRUE.equals(t.getIsSystemTemplate()) || !Boolean.TRUE.equals(t.getIsPublic()) || t.getCreatorId() != null) {
                    t.setIsSystemTemplate(true);
                    t.setIsPublic(true);
                    t.setCreatorId(null);
                    templateRepository.save(t);
                    log.info("Migrated default-4 template schema fields.");
                }
            });
        }

        if (!templateRepository.existsById("default-5")) {
            EmailTemplate default5 = EmailTemplate.builder()
                    .id("default-5")
                    .name("Product-focused Application")
                    .subject("Improving {{companyName}}'s developer experience | {{jobRole}} Application")
                    .intro("Dear {{recruiterName}},")
                    .skillsTemplate("I am a software engineer specializing in {{skills}} with a deep passion for building high-quality products that users love.")
                    .body("Throughout my {{experienceYears}} years of experience, I have focused on shipping user-centric features, optimizing performance, and collaborating closely with design and product teams.")
                    .signOff("Best,\n{{candidateName}}\n{{candidateMobile}}\n{{candidateEmail}}")
                    .isSystemTemplate(true)
                    .isPublic(true)
                    .build();
            templateRepository.save(default5);
            log.info("Seeded default-5 template.");
        } else {
            templateRepository.findById("default-5").ifPresent(t -> {
                if (!Boolean.TRUE.equals(t.getIsSystemTemplate()) || !Boolean.TRUE.equals(t.getIsPublic()) || t.getCreatorId() != null) {
                    t.setIsSystemTemplate(true);
                    t.setIsPublic(true);
                    t.setCreatorId(null);
                    templateRepository.save(t);
                    log.info("Migrated default-5 template schema fields.");
                }
            });
        }
        if (!templateRepository.existsById("cover-letter-default-1")) {
            EmailTemplate cl1 = EmailTemplate.builder()
                    .id("cover-letter-default-1")
                    .name("Standard Professional Cover Letter")
                    .subject("Cover Letter - {{candidateName}} - {{jobRole}}")
                    .intro("Dear Hiring Manager,")
                    .skillsTemplate("I am writing to express my strong enthusiasm for the {{jobRole}} position at {{companyName}}. With over {{experienceYears}} years of software engineering experience specializing in {{skills}}, I have continuously delivered scalable solutions and high-performing applications.")
                    .body("In my previous roles, I led development initiatives, collaborated across cross-functional teams, and engineered core features that directly improved performance and user engagement. My expertise in {{skills}} aligns directly with your team's current technical requirements and growth goals.")
                    .signOff("Thank you for your time and consideration. I welcome the opportunity to discuss how my background and skills can contribute to {{companyName}}.\n\nSincerely,\n{{candidateName}}\n{{candidateEmail}}\n{{candidateMobile}}")
                    .templateType("COVER_LETTER")
                    .isSystemTemplate(true)
                    .isPublic(true)
                    .build();
            templateRepository.save(cl1);
            log.info("Seeded cover-letter-default-1 template.");
        }

        if (!templateRepository.existsById("cover-letter-default-2")) {
            EmailTemplate cl2 = EmailTemplate.builder()
                    .id("cover-letter-default-2")
                    .name("Skill-Centric Technical Cover Letter")
                    .subject("Cover Letter (Technical) - {{candidateName}}")
                    .intro("Dear {{recruiterName}},")
                    .skillsTemplate("As a technical specialist proficient in {{skills}}, I am excited to apply for the {{jobRole}} role at {{companyName}}.")
                    .body("Throughout my {{experienceYears}} years in software development, I have focused on writing clean, maintainable code, solving complex technical bottlenecks, and shipping reliable products. I am particularly impressed by {{companyName}}'s engineering standards and would love to bring my technical expertise to your team.")
                    .signOff("Warm regards,\n{{candidateName}}\n{{candidateEmail}}\n{{candidateMobile}}")
                    .templateType("COVER_LETTER")
                    .isSystemTemplate(true)
                    .isPublic(true)
                    .build();
            templateRepository.save(cl2);
            log.info("Seeded cover-letter-default-2 template.");
        }

        if (!templateRepository.existsById("cover-letter-default-3")) {
            EmailTemplate cl3 = EmailTemplate.builder()
                    .id("cover-letter-default-3")
                    .name("Executive Impact Cover Letter")
                    .subject("Cover Letter (Executive) - {{candidateName}}")
                    .intro("Dear {{hrName}},")
                    .skillsTemplate("I am reaching out to submit my candidate profile for the {{jobRole}} opportunity at {{companyName}}.")
                    .body("Having spent {{experienceYears}} years driving technical product development and architectural decisions with tools like {{skills}}, I bring a strategic mindset coupled with hands-on execution capability. I excel at bridging business objectives with software architecture to deliver measurable outcomes.")
                    .signOff("Respectfully,\n{{candidateName}}\n{{candidateEmail}}\n{{candidateMobile}}")
                    .templateType("COVER_LETTER")
                    .isSystemTemplate(true)
                    .isPublic(true)
                    .build();
            templateRepository.save(cl3);
            log.info("Seeded cover-letter-default-3 template.");
        }
    }

    @GetMapping
    public ResponseEntity<List<EmailTemplate>> getAllTemplates(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String type,
            Authentication authentication) {
        log.info("Fetching templates (sortBy={}, type={})...", sortBy, type);

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
            if (type != null && !type.trim().isEmpty()) {
                final String targetType = type.trim().toUpperCase();
                templates = templateRepository.findAll(sort).stream()
                        .filter(t -> targetType.equals(t.getTemplateType()) || ("EMAIL".equals(targetType) && (t.getTemplateType() == null || t.getTemplateType().isEmpty())))
                        .collect(java.util.stream.Collectors.toList());
            } else {
                templates = templateRepository.findAll(sort);
            }
        } else {
            if (type != null && !type.trim().isEmpty()) {
                templates = templateRepository.findVisibleTemplatesByType(userId, type.trim().toUpperCase(), sort);
            } else {
                templates = templateRepository.findAllVisibleTemplates(userId, sort);
            }
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
