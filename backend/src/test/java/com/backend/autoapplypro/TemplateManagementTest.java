package com.backend.autoapplypro;

import com.backend.autoapplypro.config.JwtUtil;
import com.backend.autoapplypro.modules.billing.model.Plan;
import com.backend.autoapplypro.modules.billing.model.Subscription;
import com.backend.autoapplypro.modules.billing.repository.PlanRepository;
import com.backend.autoapplypro.modules.billing.repository.SubscriptionRepository;
import com.backend.autoapplypro.modules.outreach.model.EmailTemplate;
import com.backend.autoapplypro.modules.outreach.model.TemplateRating;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import com.backend.autoapplypro.modules.outreach.repository.TemplateRatingRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class TemplateManagementTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailTemplateRepository templateRepository;

    @Autowired
    private TemplateRatingRepository ratingRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private com.backend.autoapplypro.modules.outreach.repository.TemplateFavoriteRepository favoriteRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User freeUser;
    private User premiumUser;
    private User adminUser;

    private String freeToken;
    private String premiumToken;
    private String adminToken;

    private Plan premiumPlan;

    @BeforeEach
    void setUp() {
        // Clear templates first to avoid clashes in count tests, except default ones which we can keep or delete.
        // Let's clear ratings and templates.
        ratingRepository.deleteAll();
        templateRepository.deleteAll();

        // Seed default templates manually to make sure PostConstruct seeds are covered/tested
        EmailTemplate default1 = EmailTemplate.builder()
                .id("default-1")
                .name("General Application Outreach")
                .subject("Application for {{jobRole}} | {{hrName}}")
                .body("Hi {{hrName}}, standard body...")
                .isSystemTemplate(true)
                .isPublic(true)
                .build();
        templateRepository.save(default1);

        String suffix = UUID.randomUUID().toString().substring(0, 8);

        // 1. Create Plans
        premiumPlan = Plan.builder()
                .name("Premium Plan " + suffix)
                .amount(new BigDecimal("999.00"))
                .currency("INR")
                .billingInterval("monthly")
                .razorpayPlanId("plan_" + suffix)
                .isActive(true)
                .build();
        premiumPlan = planRepository.save(premiumPlan);

        // 2. Create Users
        freeUser = User.builder()
                .email("free_" + suffix + "@example.com")
                .passwordHash("pwd")
                .name("Free User")
                .mobile("1234567890")
                .role(UserRole.CANDIDATE)
                .build();
        freeUser = userRepository.save(freeUser);
        freeToken = jwtUtil.generateToken(freeUser.getId(), freeUser.getEmail(), freeUser.getRole().name());

        premiumUser = User.builder()
                .email("premium_" + suffix + "@example.com")
                .passwordHash("pwd")
                .name("Premium User")
                .mobile("9876543210")
                .role(UserRole.CANDIDATE)
                .build();
        premiumUser = userRepository.save(premiumUser);
        premiumToken = jwtUtil.generateToken(premiumUser.getId(), premiumUser.getEmail(), premiumUser.getRole().name());

        // Save premium subscription
        Subscription sub = Subscription.builder()
                .user(premiumUser)
                .plan(premiumPlan)
                .razorpaySubscriptionId("sub_" + suffix)
                .status("active")
                .currentPeriodStart(LocalDateTime.now())
                .currentPeriodEnd(LocalDateTime.now().plusMonths(1))
                .build();
        subscriptionRepository.save(sub);

        adminUser = User.builder()
                .email("admin_" + suffix + "@example.com")
                .passwordHash("pwd")
                .name("Admin User")
                .mobile("1112223334")
                .role(UserRole.ADMIN)
                .build();
        adminUser = userRepository.save(adminUser);
        adminToken = jwtUtil.generateToken(adminUser.getId(), adminUser.getEmail(), adminUser.getRole().name());
    }

    @Test
    void testFreeUserTemplateLimit() throws Exception {
        // Create 3 templates successfully
        for (int i = 1; i <= 3; i++) {
            EmailTemplate template = EmailTemplate.builder()
                    .name("Free Template " + i)
                    .subject("Subj " + i)
                    .body("Body " + i)
                    .isPublic(true)
                    .build();

            mockMvc.perform(post("/api/templates")
                    .header("Authorization", "Bearer " + freeToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(template)))
                    .andExpect(status().isOk());
        }

        // Try to create 4th template -> should fail with 400 Bad Request
        EmailTemplate template4 = EmailTemplate.builder()
                .name("Free Template 4")
                .subject("Subj 4")
                .body("Body 4")
                .isPublic(true)
                .build();

        mockMvc.perform(post("/api/templates")
                .header("Authorization", "Bearer " + freeToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(template4)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testPremiumUserExemptFromTemplateLimit() throws Exception {
        // Premium user should be able to create 4+ templates
        for (int i = 1; i <= 5; i++) {
            EmailTemplate template = EmailTemplate.builder()
                    .name("Premium Template " + i)
                    .subject("Subj " + i)
                    .body("Body " + i)
                    .isPublic(true)
                    .build();

            mockMvc.perform(post("/api/templates")
                    .header("Authorization", "Bearer " + premiumToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(template)))
                    .andExpect(status().isOk());
        }
    }

    @Test
    void testPrivateTemplateValidation() throws Exception {
        // Free user tries to set isPublic = false -> should fail with 400
        EmailTemplate privateTemplateFree = EmailTemplate.builder()
                .name("Free Private Template")
                .subject("Subj")
                .body("Body")
                .isPublic(false)
                .build();

        mockMvc.perform(post("/api/templates")
                .header("Authorization", "Bearer " + freeToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(privateTemplateFree)))
                .andExpect(status().isBadRequest());

        // Premium user tries to set isPublic = false -> should succeed
        EmailTemplate privateTemplatePremium = EmailTemplate.builder()
                .name("Premium Private Template")
                .subject("Subj")
                .body("Body")
                .isPublic(false)
                .build();

        mockMvc.perform(post("/api/templates")
                .header("Authorization", "Bearer " + premiumToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(privateTemplatePremium)))
                .andExpect(status().isOk());
    }

    @Test
    void testTemplateVisibilityRetrieval() throws Exception {
        // Create public template
        EmailTemplate publicTpl = EmailTemplate.builder()
                .id("pub-1")
                .name("Public Tpl")
                .subject("Subj")
                .body("Body")
                .creatorId(freeUser.getId())
                .isPublic(true)
                .build();
        templateRepository.save(publicTpl);

        // Create premium private template
        EmailTemplate privateTpl = EmailTemplate.builder()
                .id("priv-1")
                .name("Private Tpl")
                .subject("Subj")
                .body("Body")
                .creatorId(premiumUser.getId())
                .isPublic(false)
                .build();
        templateRepository.save(privateTpl);

        // 1. Free User fetches templates -> sees system, sees public, does NOT see premium's private
        mockMvc.perform(get("/api/templates")
                .header("Authorization", "Bearer " + freeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2))) // default-1 and pub-1
                .andExpect(jsonPath("$[*].name", containsInAnyOrder("General Application Outreach", "Public Tpl")))
                .andExpect(jsonPath("$[*].name", not(hasItem("Private Tpl"))));

        // 2. Premium User fetches templates -> sees system, sees public, sees own private
        mockMvc.perform(get("/api/templates")
                .header("Authorization", "Bearer " + premiumToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3))) // default-1, pub-1, priv-1
                .andExpect(jsonPath("$[*].name", containsInAnyOrder("General Application Outreach", "Public Tpl", "Private Tpl")));

        // 3. Admin fetches templates -> sees all templates
        mockMvc.perform(get("/api/templates")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[*].name", containsInAnyOrder("General Application Outreach", "Public Tpl", "Private Tpl")));
    }

    @Test
    void testRbacAndSystemTemplateProtection() throws Exception {
        // Standard user tries to PUT edit system template -> 403 Forbidden
        EmailTemplate updateSystem = EmailTemplate.builder()
                .name("Hacked Name")
                .subject("Hacked Subject")
                .body("Hacked Body")
                .isPublic(true)
                .build();

        mockMvc.perform(put("/api/templates/default-1")
                .header("Authorization", "Bearer " + freeToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateSystem)))
                .andExpect(status().isForbidden());

        // Standard user tries to DELETE system template -> 403 Forbidden
        mockMvc.perform(delete("/api/templates/default-1")
                .header("Authorization", "Bearer " + freeToken))
                .andExpect(status().isForbidden());

        // Admin updates system template -> succeeds
        mockMvc.perform(put("/api/templates/default-1")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateSystem)))
                .andExpect(status().isOk());

        // Standard user A edits standard user B's template -> 403 Forbidden
        EmailTemplate userBTemplate = EmailTemplate.builder()
                .id("tpl-user-b")
                .name("User B Template")
                .subject("Subj")
                .body("Body")
                .creatorId(premiumUser.getId())
                .isPublic(true)
                .build();
        templateRepository.save(userBTemplate);

        mockMvc.perform(put("/api/templates/tpl-user-b")
                .header("Authorization", "Bearer " + freeToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateSystem)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testRatingSystemAndSorting() throws Exception {
        // Create 2 templates
        EmailTemplate tpl1 = EmailTemplate.builder()
                .id("rate-1")
                .name("Rating Template 1")
                .subject("Subj")
                .body("Body")
                .isPublic(true)
                .build();
        templateRepository.save(tpl1);

        EmailTemplate tpl2 = EmailTemplate.builder()
                .id("rate-2")
                .name("Rating Template 2")
                .subject("Subj")
                .body("Body")
                .isPublic(true)
                .build();
        templateRepository.save(tpl2);

        // Rate tpl1 with 5 stars by premiumUser
        String ratingJson1 = "{\"rating\": 5, \"comment\": \"Awesome!\"}";
        mockMvc.perform(post("/api/templates/rate-1/rate")
                .header("Authorization", "Bearer " + premiumToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(ratingJson1))
                .andExpect(status().isOk());

        // Rate tpl2 with 3 stars by premiumUser
        String ratingJson2 = "{\"rating\": 3, \"comment\": \"Decent\"}";
        mockMvc.perform(post("/api/templates/rate-2/rate")
                .header("Authorization", "Bearer " + premiumToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(ratingJson2))
                .andExpect(status().isOk());

        // Fetch templates sorted by rating
        mockMvc.perform(get("/api/templates?sortBy=rating")
                .header("Authorization", "Bearer " + freeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is("rate-1")))  // 5.0 avg rating
                .andExpect(jsonPath("$[1].id", is("rate-2")))  // 3.0 avg rating
                .andExpect(jsonPath("$[2].id", is("default-1"))); // 0.0 avg rating
    }

    @Test
    void testTemplateFavoriting() throws Exception {
        // Toggle favorite for default-1 (not favorited initially) -> should return true (favorited)
        mockMvc.perform(post("/api/templates/default-1/favorite")
                .header("Authorization", "Bearer " + freeToken))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));

        // Get all templates -> default-1 should have isFavorited = true
        mockMvc.perform(get("/api/templates")
                .header("Authorization", "Bearer " + freeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='default-1')].isFavorited").value(true));

        // Toggle favorite again for default-1 -> should return false (unfavorited)
        mockMvc.perform(post("/api/templates/default-1/favorite")
                .header("Authorization", "Bearer " + freeToken))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));

        // Get all templates -> default-1 should now have isFavorited = false
        mockMvc.perform(get("/api/templates")
                .header("Authorization", "Bearer " + freeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='default-1')].isFavorited").value(false));
    }

    @Test
    void testUserRatingPopulation() throws Exception {
        // Rate default-1 with 4 stars by freeUser
        String ratingJson = "{\"rating\": 4, \"comment\": \"Great!\"}";
        mockMvc.perform(post("/api/templates/default-1/rate")
                .header("Authorization", "Bearer " + freeToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(ratingJson))
                .andExpect(status().isOk());

        // Get all templates for freeUser -> default-1 should have userRating = 4
        mockMvc.perform(get("/api/templates")
                .header("Authorization", "Bearer " + freeToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userRating").value(4));

        // Get all templates for premiumUser (who hasn't rated default-1) -> default-1 should have userRating = null
        mockMvc.perform(get("/api/templates")
                .header("Authorization", "Bearer " + premiumToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userRating").value(nullValue()));
    }
}
