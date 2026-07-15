package com.backend.autoapplypro;

import com.backend.autoapplypro.config.EmailTemplateEngine;
import com.backend.autoapplypro.modules.jobs.dto.JobDetailsDto;
import com.backend.autoapplypro.modules.jobs.model.JobPosting;
import com.backend.autoapplypro.modules.jobs.repository.JobPostingRepository;
import com.backend.autoapplypro.modules.outreach.dto.EmailGenerationRequestDto;
import com.backend.autoapplypro.modules.outreach.dto.EmailGenerationResponseDto;
import com.backend.autoapplypro.modules.outreach.service.EmailServiceImpl;
import com.backend.autoapplypro.modules.users.dto.CandidateProfileDto;
import com.backend.autoapplypro.modules.users.model.Company;
import com.backend.autoapplypro.modules.users.repository.CompanyRepository;
import com.backend.autoapplypro.modules.users.service.UserService;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.billing.service.SubscriptionGatingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class EmailServiceCachingTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private JobPostingRepository jobPostingRepository;

    @Mock
    private UserService userService;

    @Mock
    private EmailTemplateEngine templateEngine;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubscriptionGatingService subscriptionGatingService;

    @InjectMocks
    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        ReflectionTestUtils.setField(emailService, "self", emailService);
        ReflectionTestUtils.setField(emailService, "highIntelModel", "gemini-1.5-pro");
        ReflectionTestUtils.setField(emailService, "lowCostModel", "gemini-1.5-flash");
        ReflectionTestUtils.setField(emailService, "llmServiceUrl", "http://localhost:8000/generate-hook");

        // Mock default behavior for premium checks
        when(subscriptionGatingService.isPremiumUser(anyLong())).thenReturn(true);
        User dummyUser = User.builder().aiPersonalizationEnabled(true).build();
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(dummyUser));
    }

    @Test
    void testGenerateEmailOrchestrationWithTemplateEngine() {
        // Arrange
        EmailGenerationRequestDto dto = new EmailGenerationRequestDto();
        dto.setUserId(1L);
        JobDetailsDto jobDetails = JobDetailsDto.builder()
                .title("Software Engineer")
                .company("Google")
                .description("Build systems.")
                .hrEmails(Collections.singletonList("recruiter@google.com"))
                .build();
        dto.setJobDetails(jobDetails);

        CandidateProfileDto profile = new CandidateProfileDto();
        profile.setName("Alice");
        profile.setEmail("alice@example.com");
        profile.setExperience(new ArrayList<>());
        profile.setSkills(Collections.singletonList("Java"));

        Company mockCompany = Company.builder().id(123L).name("Google").build();
        JobPosting mockJob = JobPosting.builder().id(456L).title("Software Engineer").company("Google").build();

        when(companyRepository.findByName("Google")).thenReturn(Optional.of(mockCompany));
        when(jobPostingRepository.findByTitleAndCompany("Software Engineer", "Google")).thenReturn(Optional.of(mockJob));
        when(userService.getCandidateProfile(1L)).thenReturn(profile);
        
        EmailServiceImpl spyEmailService = spy(emailService);
        ReflectionTestUtils.setField(spyEmailService, "self", spyEmailService);
        
        doReturn("Generated AI Hook").when(spyEmailService).generateHook(
                anyLong(), anyString(), anyString(), anyString(), anyString(), anyString()
        );

        when(templateEngine.render(any(), anyMap())).thenReturn("Compiled Email Body");

        // Act
        EmailGenerationResponseDto response = spyEmailService.generateEmail(dto, false);

        // Assert
        assertNotNull(response);
        assertEquals("Application for Software Engineer at Google", response.getSubject());
        assertEquals("Compiled Email Body\n\nCompiled Email Body\n\nCompiled Email Body\n\nCompiled Email Body", response.getBody());
        assertEquals("recruiter@google.com", response.getRecipientEmail());

        verify(companyRepository, times(1)).findByName("Google");
        verify(jobPostingRepository, times(1)).findByTitleAndCompany("Software Engineer", "Google");
    }

    @Test
    void testEvictCacheOnRegenerate() {
        // Arrange
        EmailGenerationRequestDto dto = new EmailGenerationRequestDto();
        dto.setUserId(1L);
        JobDetailsDto jobDetails = JobDetailsDto.builder()
                .title("Software Engineer")
                .company("Google")
                .description("Build systems.")
                .build();
        dto.setJobDetails(jobDetails);

        CandidateProfileDto profile = new CandidateProfileDto();
        profile.setName("Alice");
        profile.setEmail("alice@example.com");

        Company mockCompany = Company.builder().id(123L).name("Google").build();
        JobPosting mockJob = JobPosting.builder().id(456L).title("Software Engineer").company("Google").build();

        when(companyRepository.findByName("Google")).thenReturn(Optional.of(mockCompany));
        when(jobPostingRepository.findByTitleAndCompany("Software Engineer", "Google")).thenReturn(Optional.of(mockJob));
        when(userService.getCandidateProfile(1L)).thenReturn(profile);
        when(cacheManager.getCache("email_hooks")).thenReturn(cache);

        EmailServiceImpl spyEmailService = spy(emailService);
        ReflectionTestUtils.setField(spyEmailService, "self", spyEmailService);
        doReturn("Regenerated Hook").when(spyEmailService).generateHook(
                anyLong(), anyString(), anyString(), anyString(), anyString(), anyString()
        );

        // Act
        spyEmailService.generateEmail(dto, true);

        // Assert
        verify(cacheManager, times(1)).getCache("email_hooks");
        verify(cache, times(1)).evict("email_hook:1:123:456");
    }
}
