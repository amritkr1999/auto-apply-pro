package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.service.MarketingEmailCampaignServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MarketingEmailCampaignServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private MarketingEmailCampaignServiceImpl campaignService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testUnsubscribeUser() {
        String token = "test-token";
        User user = new User();
        user.setEmail("user@example.com");
        user.setMarketingEmailsEnabled(true);
        user.setUnsubscribeToken(token);

        when(userRepository.findByUnsubscribeToken(token)).thenReturn(Optional.of(user));

        campaignService.unsubscribeUser(token);

        assertFalse(user.getMarketingEmailsEnabled());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testUnsubscribeUser_InvalidToken() {
        String token = "invalid-token";
        when(userRepository.findByUnsubscribeToken(token)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> campaignService.unsubscribeUser(token));
        verify(userRepository, never()).save(any());
    }
}
