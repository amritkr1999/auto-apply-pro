package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.users.dto.AuthResponse;
import com.backend.autoapplypro.modules.users.dto.LoginRequest;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserStatus;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.backend.autoapplypro.modules.users.repository.UserActivityLogRepository;
import com.backend.autoapplypro.modules.users.service.UserServiceImpl;
import com.backend.autoapplypro.config.JwtUtil;
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

class UserDeletionTest {

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
    void testRequestAccountDeletion() {
        User user = new User();
        user.setId(1L);
        user.setStatus(UserStatus.ACTIVE);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.requestAccountDeletion(1L);

        assertEquals(UserStatus.PENDING_DELETION, user.getStatus());
        assertNotNull(user.getDeletionScheduledAt());
        assertTrue(user.getDeletionScheduledAt().isAfter(LocalDateTime.now()));
        verify(userRepository, times(1)).save(user);
        verify(userActivityLogRepository, times(1)).save(any());
    }

    @Test
    void testCancelAccountDeletion() {
        User user = new User();
        user.setId(1L);
        user.setStatus(UserStatus.PENDING_DELETION);
        user.setDeletionScheduledAt(LocalDateTime.now().plusDays(14));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.cancelAccountDeletion(1L);

        assertEquals(UserStatus.ACTIVE, user.getStatus());
        assertNull(user.getDeletionScheduledAt());
        verify(userRepository, times(1)).save(user);
        verify(userActivityLogRepository, times(1)).save(any());
    }

    @Test
    void testLogin_AccountDeleted() {
        User user = new User();
        user.setId(1L);
        user.setEmail("deleted@example.com");
        user.setStatus(UserStatus.DELETED);

        LoginRequest request = new LoginRequest("deleted@example.com", "password");

        when(userRepository.findByEmail("deleted@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.login(request);
        });

        assertEquals("Invalid email or password", exception.getMessage());
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void testLogin_AccountPendingDeletion() {
        User user = new User();
        user.setId(1L);
        user.setEmail("pending@example.com");
        user.setPasswordHash("hashedPassword");
        user.setStatus(UserStatus.PENDING_DELETION);
        user.setDeletionScheduledAt(LocalDateTime.now().plusDays(10));
        user.setRole(UserRole.CANDIDATE);
        user.setName("Pending User");

        LoginRequest request = new LoginRequest("pending@example.com", "password");

        when(userRepository.findByEmail("pending@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashedPassword")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("mockToken");

        AuthResponse response = userService.login(request);

        assertNotNull(response);
        assertTrue(response.getIsPendingDeletion());
        assertNotNull(response.getDeletionScheduledAt());
        verify(userRepository, times(1)).save(user);
        verify(userActivityLogRepository, times(1)).save(any());
    }
}
