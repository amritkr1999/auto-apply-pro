package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.jobs.repository.JobApplicationRepository;
import com.backend.autoapplypro.modules.outreach.dto.DailyDigestDto;
import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import com.backend.autoapplypro.modules.outreach.repository.EmailQueueRepository;
import com.backend.autoapplypro.modules.outreach.service.DailyDigestServiceImpl;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.service.SystemEmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DailyDigestServiceTest {

    @Mock
    private EmailQueueRepository emailQueueRepository;

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SystemEmailService systemEmailService;

    @InjectMocks
    private DailyDigestServiceImpl dailyDigestService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(100L)
                .name("Alex Johnson")
                .email("alex@example.com")
                .sentToday(12)
                .dailyLimit(50)
                .dailyDigestEnabled(true)
                .dailyDigestTime(LocalTime.of(20, 0))
                .build();
    }

    @Test
    void testGenerateDailyDigest_Success() {
        LocalDate date = LocalDate.now();

        EmailQueue sent1 = EmailQueue.builder()
                .id(1L)
                .recipientEmail("hr@techcorp.com")
                .subject("Application for Senior Engineer")
                .status(OutreachStatus.SENT)
                .sentAt(LocalDateTime.now())
                .isCampaign(false)
                .build();

        EmailQueue sent2 = EmailQueue.builder()
                .id(2L)
                .recipientEmail("recruiter@innovate.io")
                .subject("HR Campaign: Experienced Java Developer")
                .status(OutreachStatus.SENT)
                .sentAt(LocalDateTime.now())
                .isCampaign(true)
                .build();

        EmailQueue draft = EmailQueue.builder()
                .id(3L)
                .recipientEmail("talent@startups.co")
                .subject("Software Engineer Inquiry")
                .status(OutreachStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        when(emailQueueRepository.findByUserIdAndSentAtBetween(eq(100L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(sent1, sent2));
        when(emailQueueRepository.findByUserIdAndStatus(eq(100L), eq(OutreachStatus.PENDING)))
                .thenReturn(List.of(draft));
        when(jobApplicationRepository.findByUserIdAndCreatedAtBetween(eq(100L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());

        DailyDigestDto dto = dailyDigestService.generateDailyDigest(testUser, date);

        assertNotNull(dto);
        assertEquals("Alex Johnson", dto.getUserName());
        assertEquals("alex@example.com", dto.getUserEmail());
        assertEquals(2, dto.getTotalEmailsSentToday());
        assertEquals(0, dto.getTotalEmailsFailedToday());
        assertEquals(1, dto.getPendingDraftsCount());
        assertEquals(12, dto.getSentTodayQuota());
        assertEquals(50, dto.getDailyLimitQuota());
        assertEquals(38, dto.getRemainingQuota());
        assertEquals(2, dto.getRecipients().size());
    }

    @Test
    void testBuildDailyDigestHtml_ContainsKeySections() {
        DailyDigestDto dto = DailyDigestDto.builder()
                .digestDate(LocalDate.now())
                .userName("Alex Johnson")
                .userEmail("alex@example.com")
                .totalEmailsSentToday(5)
                .totalEmailsFailedToday(0)
                .pendingDraftsCount(3)
                .applicationsLoggedCount(4)
                .sentTodayQuota(5)
                .dailyLimitQuota(50)
                .remainingQuota(45)
                .recipients(Collections.emptyList())
                .pendingDrafts(Collections.emptyList())
                .feedbackLink("https://easynaukri.online/feedback?ref=eod_digest")
                .build();

        String html = dailyDigestService.buildDailyDigestHtml(dto);

        assertNotNull(html);
        assertTrue(html.contains("EasyNaukri"));
        assertTrue(html.contains("EOD Synopsis"));
        assertTrue(html.contains("Alex Johnson"));
        assertTrue(html.contains("How was your application outreach today?"));
        assertTrue(html.contains("rating=5"));
    }

    @Test
    void testSendDailyDigestForUser_Success() {
        when(emailQueueRepository.findByUserIdAndSentAtBetween(eq(100L), any(), any())).thenReturn(Collections.emptyList());
        when(emailQueueRepository.findByUserIdAndStatus(eq(100L), any())).thenReturn(Collections.emptyList());
        when(jobApplicationRepository.findByUserIdAndCreatedAtBetween(eq(100L), any(), any())).thenReturn(Collections.emptyList());

        boolean result = dailyDigestService.sendDailyDigestForUser(testUser, LocalDate.now());

        assertTrue(result);
        verify(systemEmailService, times(1)).sendDailyDigestEmail(eq("alex@example.com"), anyString(), anyString());
        verify(userRepository, times(1)).save(testUser);
        assertEquals(LocalDate.now(), testUser.getLastDigestSentDate());
    }
}
