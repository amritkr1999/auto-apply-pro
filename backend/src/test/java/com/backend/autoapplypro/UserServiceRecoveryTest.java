package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.users.dto.ForgotPasswordRequest;
import com.backend.autoapplypro.modules.users.dto.ResetPasswordRequest;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.repository.UserActivityLogRepository;
import com.backend.autoapplypro.modules.users.service.SystemEmailService;
import com.backend.autoapplypro.modules.users.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceRecoveryTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserActivityLogRepository userActivityLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SystemEmailService systemEmailService;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testInitiatePasswordReset_UserExists() {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");

        ForgotPasswordRequest request = new ForgotPasswordRequest("user@example.com");

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.initiatePasswordReset(request);

        assertNotNull(user.getResetToken());
        assertNotNull(user.getResetTokenExpiry());
        assertTrue(user.getResetTokenExpiry().isAfter(LocalDateTime.now()));
        verify(userRepository, times(1)).save(user);
        verify(systemEmailService, times(1)).sendPasswordResetEmail(eq("user@example.com"), anyString());
    }

    @Test
    void testInitiatePasswordReset_UserExistsMixedCase() {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");

        ForgotPasswordRequest request = new ForgotPasswordRequest("UsEr@ExAmPlE.cOm ");

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.initiatePasswordReset(request);

        assertNotNull(user.getResetToken());
        verify(systemEmailService, times(1)).sendPasswordResetEmail(eq("user@example.com"), anyString());
    }

    @Test
    void testInitiatePasswordReset_UserNotFound() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("nonexistent@example.com");

        when(userRepository.findByEmailIgnoreCase("nonexistent@example.com")).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> userService.initiatePasswordReset(request));

        verify(userRepository, never()).save(any());
        verify(systemEmailService, never()).sendPasswordResetEmail(any(), any());
    }

    @Test
    void testResetPassword_Success() {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setResetToken("valid-token");
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));

        ResetPasswordRequest request = new ResetPasswordRequest("valid-token", "newSecretPassword123");

        when(userRepository.findByResetToken("valid-token")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newSecretPassword123")).thenReturn("hashedNewSecretPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.resetPassword(request);

        assertEquals("hashedNewSecretPassword", user.getPasswordHash());
        assertNull(user.getResetToken());
        assertNull(user.getResetTokenExpiry());
        verify(userRepository, times(1)).save(user);
        verify(userActivityLogRepository, times(1)).save(any());
    }

    @Test
    void testResetPassword_InvalidToken() {
        ResetPasswordRequest request = new ResetPasswordRequest("invalid-token", "newSecretPassword123");

        when(userRepository.findByResetToken("invalid-token")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.resetPassword(request);
        });

        assertEquals("Invalid password reset token", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testResetPassword_ExpiredToken() {
        User user = new User();
        user.setId(1L);
        user.setResetToken("expired-token");
        user.setResetTokenExpiry(LocalDateTime.now().minusMinutes(5)); // Expired 5 minutes ago

        ResetPasswordRequest request = new ResetPasswordRequest("expired-token", "newSecretPassword123");

        when(userRepository.findByResetToken("expired-token")).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.resetPassword(request);
        });

        assertEquals("Password reset token has expired", exception.getMessage());
        verify(userRepository, never()).save(any());
    }
}
