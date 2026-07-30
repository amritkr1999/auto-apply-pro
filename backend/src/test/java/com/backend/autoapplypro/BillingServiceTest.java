package com.backend.autoapplypro;

import com.backend.autoapplypro.modules.billing.dto.PaymentTransactionDto;
import com.backend.autoapplypro.modules.billing.model.PaymentTransaction;
import com.backend.autoapplypro.modules.billing.model.Plan;
import com.backend.autoapplypro.modules.billing.model.Subscription;
import com.backend.autoapplypro.modules.billing.repository.PaymentTransactionRepository;
import com.backend.autoapplypro.modules.billing.repository.PlanRepository;
import com.backend.autoapplypro.modules.billing.repository.SubscriptionRepository;
import com.backend.autoapplypro.modules.billing.service.BillingService;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.razorpay.RazorpayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private RazorpayClient razorpayClient;

    @Mock
    private PlanRepository planRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BillingService billingService;

    private User sampleUser;
    private Subscription sampleSubscription;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("testuser@example.com")
                .name("Test User")
                .build();

        Plan samplePlan = Plan.builder()
                .id(10L)
                .name("Candidate Pro")
                .amount(new BigDecimal("99.00"))
                .currency("INR")
                .razorpayPlanId("plan_PRM99INR")
                .build();

        sampleSubscription = Subscription.builder()
                .id(100L)
                .user(sampleUser)
                .plan(samplePlan)
                .razorpaySubscriptionId("sub_123456")
                .status("active")
                .build();
    }

    @Test
    @DisplayName("Should fetch user payment history using direct JOIN repository query in single call")
    void testGetPaymentHistory_SingleQuery() {
        Long userId = 1L;
        PaymentTransaction tx1 = PaymentTransaction.builder()
                .id(1001L)
                .subscription(sampleSubscription)
                .razorpayPaymentId("pay_001")
                .amount(new BigDecimal("99.00"))
                .status("captured")
                .paymentMethod("upi")
                .createdAt(LocalDateTime.now())
                .build();

        PaymentTransaction tx2 = PaymentTransaction.builder()
                .id(1002L)
                .subscription(sampleSubscription)
                .razorpayPaymentId("pay_002")
                .amount(new BigDecimal("99.00"))
                .status("captured")
                .paymentMethod("card")
                .createdAt(LocalDateTime.now().minusDays(30))
                .build();

        when(paymentTransactionRepository.findBySubscriptionUserIdOrderByCreatedAtDesc(userId))
                .thenReturn(List.of(tx1, tx2));

        List<PaymentTransactionDto> history = billingService.getPaymentHistory(userId);

        assertNotNull(history);
        assertEquals(2, history.size());
        assertEquals("pay_001", history.get(0).getRazorpayPaymentId());
        assertEquals("pay_002", history.get(1).getRazorpayPaymentId());

        verify(paymentTransactionRepository, times(1)).findBySubscriptionUserIdOrderByCreatedAtDesc(userId);
        verifyNoInteractions(subscriptionRepository);
    }
}
