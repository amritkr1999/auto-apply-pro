package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.billing.model.UpiPaymentStatus;
import com.backend.autoapplypro.modules.billing.model.UpiPaymentTransaction;
import com.backend.autoapplypro.modules.billing.repository.UpiPaymentTransactionRepository;
import com.backend.autoapplypro.modules.billing.service.TelegramBotService;
import com.backend.autoapplypro.modules.billing.service.UpiPaymentService;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UpiPaymentServiceTest {

    @Mock
    private UpiPaymentTransactionRepository upiPaymentTransactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TelegramBotService telegramBotService;

    @InjectMocks
    private UpiPaymentService upiPaymentService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("testuser@example.com")
                .name("Test User")
                .mobile("9876543210")
                .role(UserRole.CANDIDATE)
                .isPremium(false)
                .build();
    }

    @Test
    @DisplayName("Should successfully submit valid 12-digit UTR and trigger Telegram notification")
    void testSubmitUtr_Success() {
        String utr = "123456789012";
        BigDecimal amount = new BigDecimal("499.00");

        when(upiPaymentTransactionRepository.existsByUtrNumber(utr)).thenReturn(false);
        when(upiPaymentTransactionRepository.save(any(UpiPaymentTransaction.class)))
                .thenAnswer(invocation -> {
                    UpiPaymentTransaction tx = invocation.getArgument(0);
                    tx.setId(100L);
                    return tx;
                });
        when(telegramBotService.sendPaymentNotification(any(UpiPaymentTransaction.class))).thenReturn(501);

        UpiPaymentTransaction result = upiPaymentService.submitUtr(sampleUser, utr, amount);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals(utr, result.getUtrNumber());
        assertEquals(UpiPaymentStatus.PENDING, result.getStatus());
        assertEquals(501, result.getTelegramMessageId());

        verify(upiPaymentTransactionRepository, times(2)).save(any(UpiPaymentTransaction.class));
        verify(telegramBotService).sendPaymentNotification(any(UpiPaymentTransaction.class));
    }

    @Test
    @DisplayName("Should throw exception for invalid UTR format")
    void testSubmitUtr_InvalidUtrFormat() {
        String invalidUtr = "12345"; // Not 12 digits
        BigDecimal amount = new BigDecimal("499.00");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> upiPaymentService.submitUtr(sampleUser, invalidUtr, amount)
        );

        assertTrue(exception.getMessage().contains("12 digits"));
        verifyNoInteractions(telegramBotService);
    }

    @Test
    @DisplayName("Should throw exception for duplicate UTR number")
    void testSubmitUtr_DuplicateUtr() {
        String duplicateUtr = "123456789012";
        when(upiPaymentTransactionRepository.existsByUtrNumber(duplicateUtr)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> upiPaymentService.submitUtr(sampleUser, duplicateUtr, new BigDecimal("499.00"))
        );

        assertTrue(exception.getMessage().contains("already been submitted"));
        verifyNoInteractions(telegramBotService);
    }

    @Test
    @DisplayName("Should approve transaction and upgrade user to PRO when Telegram approve callback is received")
    void testHandleTelegramCallback_Approve() {
        Long txId = 100L;
        UpiPaymentTransaction tx = UpiPaymentTransaction.builder()
                .id(txId)
                .user(sampleUser)
                .utrNumber("123456789012")
                .amount(new BigDecimal("499.00"))
                .status(UpiPaymentStatus.PENDING)
                .build();

        when(upiPaymentTransactionRepository.findById(txId)).thenReturn(Optional.of(tx));

        Map<String, Object> updatePayload = Map.of(
                "callback_query", Map.of(
                        "id", "cb_123",
                        "data", "approve_" + txId,
                        "message", Map.of(
                                "message_id", 501,
                                "chat", Map.of("id", 6023053509L)
                        )
                )
        );

        String result = upiPaymentService.handleTelegramCallback(updatePayload);

        assertEquals("OK", result);
        assertEquals(UpiPaymentStatus.APPROVED, tx.getStatus());
        assertTrue(sampleUser.getIsPremium());
        assertEquals(UserRole.PRO, sampleUser.getRole());

        verify(userRepository).save(sampleUser);
        verify(upiPaymentTransactionRepository).save(tx);
        verify(telegramBotService).editMessage(eq("6023053509"), eq(501), contains("Approved"));
        verify(telegramBotService).answerCallbackQuery(eq("cb_123"), contains("Approved"));
    }

    @Test
    @DisplayName("Should reject transaction when Telegram reject callback is received")
    void testHandleTelegramCallback_Reject() {
        Long txId = 101L;
        UpiPaymentTransaction tx = UpiPaymentTransaction.builder()
                .id(txId)
                .user(sampleUser)
                .utrNumber("987654321098")
                .amount(new BigDecimal("499.00"))
                .status(UpiPaymentStatus.PENDING)
                .build();

        when(upiPaymentTransactionRepository.findById(txId)).thenReturn(Optional.of(tx));

        Map<String, Object> updatePayload = Map.of(
                "callback_query", Map.of(
                        "id", "cb_456",
                        "data", "reject_" + txId,
                        "message", Map.of(
                                "message_id", 502,
                                "chat", Map.of("id", 6023053509L)
                        )
                )
        );

        String result = upiPaymentService.handleTelegramCallback(updatePayload);

        assertEquals("OK", result);
        assertEquals(UpiPaymentStatus.REJECTED, tx.getStatus());
        assertFalse(sampleUser.getIsPremium());

        verify(upiPaymentTransactionRepository).save(tx);
        verify(telegramBotService).editMessage(eq("6023053509"), eq(502), contains("Rejected"));
        verify(telegramBotService).answerCallbackQuery(eq("cb_456"), contains("Rejected"));
    }
}
