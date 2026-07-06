package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.users.model.Candidate;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.CandidateRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.dto.CandidateProfileDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class PublicProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    private String publicUsername;
    private String privateUsername;

    @BeforeEach
    void setUp() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        publicUsername = "public_dev_" + uniqueSuffix;
        privateUsername = "private_dev_" + uniqueSuffix;

        // 1. Create a public user
        User publicUser = User.builder()
                .email("public_" + uniqueSuffix + "@example.com")
                .passwordHash("hashedpwd")
                .name("Public Developer")
                .mobile("9876543210")
                .role(UserRole.CANDIDATE)
                .username(publicUsername)
                .isProfilePublic(true)
                .build();
        publicUser = userRepository.save(publicUser);

        Candidate publicCand = Candidate.builder()
                .user(publicUser)
                .summary("This is a public bio")
                .githubUsername("pubgithub")
                .githubProfileUrl("https://github.com/pubgithub")
                .leetcodeUsername("publeetcode")
                .isVerified(true)
                .skills(new HashSet<>())
                .githubStats(new HashMap<>(Map.of("repos", 20)))
                .build();
        candidateRepository.save(publicCand);

        // 2. Create a private user
        User privateUser = User.builder()
                .email("private_" + uniqueSuffix + "@example.com")
                .passwordHash("hashedpwd")
                .name("Private Developer")
                .mobile("5555555555")
                .role(UserRole.CANDIDATE)
                .username(privateUsername)
                .isProfilePublic(false)
                .build();
        privateUser = userRepository.save(privateUser);

        Candidate privateCand = Candidate.builder()
                .user(privateUser)
                .summary("This is a private bio")
                .skills(new HashSet<>())
                .build();
        candidateRepository.save(privateCand);
    }

    @Test
    void testGetPublicProfile_Success() throws Exception {
        mockMvc.perform(get("/api/v1/public/profile/" + publicUsername)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is(publicUsername)))
                .andExpect(jsonPath("$.name", is("Public Developer")))
                .andExpect(jsonPath("$.summary", is("This is a public bio")))
                .andExpect(jsonPath("$.isVerified", is(true)))
                // Explicitly check that sensitive fields are NOT present in DTO or returned JSON
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.mobile").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void testGetPublicProfile_Private_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/public/profile/" + privateUsername)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetPublicProfile_NonExistent_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/public/profile/non_existent_username_" + UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Autowired
    private com.backend.autoapplypro.modules.users.service.UserService userService;

    @Test
    void testGetCandidateProfile_AutoInitializesIfMissing() {
        String uniqueEmail = "nocandidate_" + UUID.randomUUID() + "@example.com";
        User user = User.builder()
                .email(uniqueEmail)
                .passwordHash("pwd")
                .name("No Candidate User")
                .mobile("1111111111")
                .role(UserRole.CANDIDATE)
                .build();
        user = userRepository.save(user);

        org.junit.jupiter.api.Assertions.assertFalse(candidateRepository.findByUserId(user.getId()).isPresent());

        CandidateProfileDto profile = userService.getCandidateProfile(user.getId());

        org.junit.jupiter.api.Assertions.assertNotNull(profile);
        org.junit.jupiter.api.Assertions.assertEquals(user.getId(), profile.getUserId());
        org.junit.jupiter.api.Assertions.assertTrue(candidateRepository.findByUserId(user.getId()).isPresent());
    }

    @Test
    void testCheckUsernameAvailability() throws Exception {
        mockMvc.perform(get("/api/v1/public/profile/check-username")
                .param("username", publicUsername)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available", is(false)));

        mockMvc.perform(get("/api/v1/public/profile/check-username")
                .param("username", "completely_new_random_username_" + UUID.randomUUID().toString().substring(0, 8))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available", is(true)));
    }
}
