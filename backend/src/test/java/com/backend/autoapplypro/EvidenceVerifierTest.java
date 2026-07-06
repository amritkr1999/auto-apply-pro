package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.users.dto.AchievementDto;
import com.backend.autoapplypro.modules.users.dto.CandidateProfileDto;
import com.backend.autoapplypro.modules.users.model.Achievement;
import com.backend.autoapplypro.modules.users.model.Candidate;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.public_profile.evidence.EvidenceVerifier;
import com.backend.autoapplypro.modules.users.public_profile.evidence.VerificationStatus;
import com.backend.autoapplypro.modules.users.repository.CandidateRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EvidenceVerifierTest {

    private final EvidenceVerifier evidenceVerifier = new EvidenceVerifier();

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testScoringAlgorithm() {
        // Baseline only
        int baseline = evidenceVerifier.calculateTrustScore(false, false, false);
        assertEquals(10, baseline);

        // OAuth only
        int oauth = evidenceVerifier.calculateTrustScore(true, false, false);
        assertEquals(60, oauth);

        // Doc-AI only
        int doc = evidenceVerifier.calculateTrustScore(false, true, false);
        assertEquals(40, doc);

        // Reference check only
        int ref = evidenceVerifier.calculateTrustScore(false, false, true);
        assertEquals(50, ref);

        // OAuth + Reference Check (50 + 40 = 90 + 10 baseline = 100)
        int oauthRef = evidenceVerifier.calculateTrustScore(true, false, true);
        assertEquals(100, oauthRef);
    }

    @Test
    void testVerificationStatusTransition() {
        assertEquals(VerificationStatus.NONE, evidenceVerifier.determineVerificationStatus(69));
        assertEquals(VerificationStatus.NONE, evidenceVerifier.determineVerificationStatus(70));
        assertEquals(VerificationStatus.VERIFIED, evidenceVerifier.determineVerificationStatus(71));
        assertEquals(VerificationStatus.VERIFIED, evidenceVerifier.determineVerificationStatus(100));
    }

    @Test
    void testThreadSafetyOfVerifier() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        List<Future<Integer>> futures = new ArrayList<>();

        for (int i = 0; i < 100; i++) {
            futures.add(executor.submit(() -> evidenceVerifier.calculateTrustScore(true, true, true)));
        }

        for (Future<Integer> future : futures) {
            assertEquals(100, future.get().intValue());
        }
        executor.shutdown();
    }

    @Test
    void testManualEditIntegrityHook() {
        // Setup existing candidate with a verified achievement
        User user = new User();
        user.setId(1L);
        user.setName("John Doe");
        user.setRole(com.backend.autoapplypro.modules.users.model.UserRole.CANDIDATE);

        Candidate candidate = new Candidate();
        candidate.setId(1L);
        candidate.setUser(user);

        Achievement verifiedAch = Achievement.builder()
                .id(100L)
                .title("Original Title")
                .description("Original Description")
                .category("GitHub")
                .badgeUrl("⭐")
                .verificationStatus(VerificationStatus.VERIFIED)
                .trustScore(90)
                .isVerified(true)
                .candidate(candidate)
                .build();

        List<Achievement> existingAchievements = new ArrayList<>();
        existingAchievements.add(verifiedAch);
        candidate.setAchievements(existingAchievements);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(candidateRepository.findByUserId(1L)).thenReturn(Optional.of(candidate));
        when(candidateRepository.save(any(Candidate.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Create update payload where title is modified
        CandidateProfileDto updateDto = new CandidateProfileDto();
        updateDto.setName("John Doe");
        List<AchievementDto> editPayload = new ArrayList<>();
        editPayload.add(AchievementDto.builder()
                .id(100L)
                .title("Modified Title") // manual edit
                .description("Original Description")
                .category("GitHub")
                .badgeUrl("⭐")
                .build());
        updateDto.setAchievements(editPayload);

        // Run update
        CandidateProfileDto resultDto = userService.updateCandidateProfile(1L, updateDto);

        // Verify result has reset to NONE status and 10 trust score
        assertNotNull(resultDto.getAchievements());
        assertEquals(1, resultDto.getAchievements().size());
        AchievementDto resultAch = resultDto.getAchievements().get(0);
        assertEquals("Modified Title", resultAch.getTitle());
        assertEquals("NONE", resultAch.getVerificationStatus());
        assertEquals(10, resultAch.getTrustScore());
        assertFalse(resultAch.getIsVerified());
    }
}
