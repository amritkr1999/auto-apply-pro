package com.backend.autoapplypro;

import com.backend.autoapplypro.config.JwtUtil;
import com.backend.autoapplypro.modules.users.dto.AuthResponse;
import com.backend.autoapplypro.modules.users.dto.LoginRequest;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.repository.UserActivityLogRepository;
import com.backend.autoapplypro.modules.users.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceStreakTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserActivityLogRepository userActivityLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLogin_FreshStreak() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword");
        user.setRole(com.backend.autoapplypro.modules.users.model.UserRole.CANDIDATE);
        user.setIsEmailVerified(true);
        user.setLoginStreak(0);
        user.setLastLoginDate(null);

        LoginRequest request = new LoginRequest("test@example.com", "password");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("mockToken");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals(1, response.getLoginStreak());
        assertEquals(LocalDate.now(), user.getLastLoginDate());
        verify(userActivityLogRepository, times(1)).save(any());
    }

    @Test
    void testLogin_StreakIncrement() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword");
        user.setRole(com.backend.autoapplypro.modules.users.model.UserRole.CANDIDATE);
        user.setIsEmailVerified(true);
        user.setLoginStreak(3);
        user.setLastLoginDate(LocalDate.now().minusDays(1)); // Yesterday

        LoginRequest request = new LoginRequest("test@example.com", "password");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("mockToken");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals(4, response.getLoginStreak());
        assertEquals(LocalDate.now(), user.getLastLoginDate());
    }

    @Test
    void testLogin_StreakMaintainSameDay() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword");
        user.setRole(com.backend.autoapplypro.modules.users.model.UserRole.CANDIDATE);
        user.setIsEmailVerified(true);
        user.setLoginStreak(3);
        user.setLastLoginDate(LocalDate.now()); // Today

        LoginRequest request = new LoginRequest("test@example.com", "password");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("mockToken");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals(3, response.getLoginStreak());
        assertEquals(LocalDate.now(), user.getLastLoginDate());
    }

    @Test
    void testLogin_StreakReset() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword");
        user.setRole(com.backend.autoapplypro.modules.users.model.UserRole.CANDIDATE);
        user.setIsEmailVerified(true);
        user.setLoginStreak(5);
        user.setLastLoginDate(LocalDate.now().minusDays(3)); // 3 days ago

        LoginRequest request = new LoginRequest("test@example.com", "password");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("mockToken");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals(1, response.getLoginStreak());
        assertEquals(LocalDate.now(), user.getLastLoginDate());
    }

    @Test
    void testUserUpdateLoginStreak_DirectCalls() {
        User user = new User();
        user.setLastLoginDate(null);
        user.setLoginStreak(0);
        assertTrue(user.updateLoginStreak());
        assertEquals(1, user.getLoginStreak());
        assertEquals(LocalDate.now(), user.getLastLoginDate());

        // Same day call: returns false, keeps streak
        assertFalse(user.updateLoginStreak());
        assertEquals(1, user.getLoginStreak());

        // Consecutive day
        user.setLastLoginDate(LocalDate.now().minusDays(1));
        assertTrue(user.updateLoginStreak());
        assertEquals(2, user.getLoginStreak());
        assertEquals(LocalDate.now(), user.getLastLoginDate());

        // Missed multiple days
        user.setLastLoginDate(LocalDate.now().minusDays(5));
        assertTrue(user.updateLoginStreak());
        assertEquals(1, user.getLoginStreak());
        assertEquals(LocalDate.now(), user.getLastLoginDate());
    }
}
