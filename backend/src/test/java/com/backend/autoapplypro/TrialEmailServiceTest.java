package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.outreach.dto.TrialEmailRequestDto;
import com.backend.autoapplypro.modules.outreach.dto.TrialEmailResponseDto;
import com.backend.autoapplypro.modules.outreach.model.GmailCredential;
import com.backend.autoapplypro.modules.outreach.repository.EmailTemplateRepository;
import com.backend.autoapplypro.modules.outreach.repository.GmailCredentialRepository;
import com.backend.autoapplypro.modules.outreach.service.EmailSender;
import com.backend.autoapplypro.modules.outreach.service.TrialEmailService;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.ProfessionalProfileRepository;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class TrialEmailServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailTemplateRepository templateRepository;

    @Mock
    private ProfessionalProfileRepository profileRepository;

    @Mock
    private GmailCredentialRepository gmailCredentialRepository;

    @Mock
    private EmailSender emailSender;

    @InjectMocks
    private TrialEmailService trialEmailService;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User();
        testUser.setId(100L);
        testUser.setName("Alex Developer");
        testUser.setEmail("alex.dev@example.com");
        testUser.setMobile("+1234567890");
        testUser.setHrOutreachTargetRole("Full Stack Engineer");

        when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));
    }

    @Test
    void testSendTrialEmail_MissingGmailCredentials_ReturnsError() {
        when(gmailCredentialRepository.findByUserId(100L)).thenReturn(Optional.empty());

        TrialEmailRequestDto request = TrialEmailRequestDto.builder()
                .subject("Test Subject")
                .body("Test Body")
                .build();

        TrialEmailResponseDto response = trialEmailService.sendTrialEmail(100L, request);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("Gmail account not connected"));
        verify(emailSender, never()).sendEmail(anyLong(), anyString(), anyString(), anyString());
    }

    @Test
    void testSendTrialEmail_Success_DefaultsToUserEmail() {
        GmailCredential credential = new GmailCredential();
        credential.setConnectedEmail("alex.dev@example.com");
        when(gmailCredentialRepository.findByUserId(100L)).thenReturn(Optional.of(credential));

        TrialEmailRequestDto request = TrialEmailRequestDto.builder()
                .subject("Role Application {{jobRole}} | {{companyName}}")
                .body("Hello {{hrName}},\n\nI am {{candidateName}} applying for {{jobRole}} at {{companyName}}.")
                .sampleData(Map.of(
                        "companyName", "TechCorp",
                        "hrName", "Sarah Recruiter"
                ))
                .build();

        TrialEmailResponseDto response = trialEmailService.sendTrialEmail(100L, request);

        assertTrue(response.isSuccess());
        assertEquals("alex.dev@example.com", response.getRecipientEmail());

        ArgumentCaptor<String> recipientCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> subjectCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> bodyCaptor = ArgumentCaptor.forClass(String.class);

        verify(emailSender).sendEmail(eq(100L), recipientCaptor.capture(), subjectCaptor.capture(), bodyCaptor.capture());

        assertEquals("alex.dev@example.com", recipientCaptor.getValue());
        assertTrue(subjectCaptor.getValue().startsWith("[TRIAL EMAIL]"));
        assertTrue(subjectCaptor.getValue().contains("TechCorp"));
        assertTrue(bodyCaptor.getValue().contains("Sarah Recruiter"));
        assertTrue(bodyCaptor.getValue().contains("Alex Developer"));
        assertTrue(bodyCaptor.getValue().contains("Full Stack Engineer"));
    }

    @Test
    void testSendTrialEmail_CustomRecipientEmail() {
        GmailCredential credential = new GmailCredential();
        credential.setConnectedEmail("alex.dev@example.com");
        when(gmailCredentialRepository.findByUserId(100L)).thenReturn(Optional.of(credential));

        TrialEmailRequestDto request = TrialEmailRequestDto.builder()
                .targetEmail("friend.tester@example.com")
                .subject("Verification for {{jobRole}}")
                .body("Hi {{hrName}}, testing custom email delivery.")
                .build();

        TrialEmailResponseDto response = trialEmailService.sendTrialEmail(100L, request);

        assertTrue(response.isSuccess());
        assertEquals("friend.tester@example.com", response.getRecipientEmail());
        verify(emailSender).sendEmail(eq(100L), eq("friend.tester@example.com"), anyString(), anyString());
    }
}
