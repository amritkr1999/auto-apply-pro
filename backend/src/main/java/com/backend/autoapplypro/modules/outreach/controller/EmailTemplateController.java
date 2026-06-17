package com.backend.autoapplypro.modules.outreach.controller;

import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EmailTemplateController {

    private final EmailTemplateRepository templateRepository;

    @PostConstruct
    public void seedDefaultTemplates() {
        log.info("Checking for default email templates in database...");
        if (!templateRepository.existsById("default-1")) {
            EmailTemplate default1 = EmailTemplate.builder()
                    .id("default-1")
                    .name("General Application Outreach")
                    .subject("Application for {{jobRole}} | {{hrName}}")
                    .body("Hi {{hrName}},<br/><br/>I hope you are doing well.<br/><br/>I am reaching out to express my interest in the <strong>{{jobRole}}</strong> position at <strong>{{companyName}}</strong>. Having worked with frontend systems, I believe my background aligns well with your team's current expansion goals.<br/><br/>Please find my profile details attached. I would love to connect and discuss how I can add value to {{companyName}}.<br/><br/>Best regards,<br/>Candidate User")
                    .build();
            templateRepository.save(default1);
            log.info("Seeded default-1 template.");
        }

        if (!templateRepository.existsById("default-2")) {
            EmailTemplate default2 = EmailTemplate.builder()
                    .id("default-2")
                    .name("Quick Follow-Up Template")
                    .subject("Follow up: {{jobRole}} application - {{companyName}}")
                    .body("Hi {{hrName}},<br/><br/>Hope your week is going well.<br/><br/>I wanted to quickly check in on my application for the <strong>{{jobRole}}</strong> role. I remain very excited about the opportunity to join <strong>{{companyName}}</strong> and would love to share more about my experience.<br/><br/>Looking forward to hearing from you.<br/><br/>Best,<br/>Candidate User")
                    .build();
            templateRepository.save(default2);
            log.info("Seeded default-2 template.");
        }
    }

    @GetMapping
    public ResponseEntity<List<EmailTemplate>> getAllTemplates() {
        log.info("Fetching all email templates...");
        return ResponseEntity.ok(templateRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<EmailTemplate> saveTemplate(@RequestBody EmailTemplate template) {
        log.info("Saving template: {}", template.getName());
        if (template.getId() == null || template.getId().trim().isEmpty()) {
            template.setId("tpl-" + System.currentTimeMillis());
        }
        EmailTemplate saved = templateRepository.save(template);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        log.info("Deleting template ID: {}", id);
        if (templateRepository.existsById(id)) {
            templateRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
