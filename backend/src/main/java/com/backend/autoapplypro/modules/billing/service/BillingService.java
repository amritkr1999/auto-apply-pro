package com.backend.autoapplypro.modules.billing.service;

import com.backend.autoapplypro.modules.billing.dto.*;
import com.backend.autoapplypro.modules.billing.model.PaymentTransaction;
import com.backend.autoapplypro.modules.billing.model.Plan;
import com.backend.autoapplypro.modules.billing.model.Subscription;
import com.backend.autoapplypro.modules.billing.repository.PaymentTransactionRepository;
import com.backend.autoapplypro.modules.billing.repository.PlanRepository;
import com.backend.autoapplypro.modules.billing.repository.SubscriptionRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final RazorpayClient razorpayClient;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final UserRepository userRepository;

    @Value("${razorpay.key.id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:test_secret_placeholder}")
    private String razorpayKeySecret;

    @PostConstruct
    public void init() {
        if (planRepository.count() == 0) {
            Plan defaultPlan = Plan.builder()
                    .name("Premium Monthly Plan")
                    .description("Full access to job application automation, tailored resumes, and advanced outreach tracking.")
                    .amount(new BigDecimal("999.00"))
                    .currency("INR")
                    .billingInterval("monthly")
                    .razorpayPlanId("plan_PRM123456789") // Standard developer test / fallback plan ID
                    .isActive(true)
                    .build();
            planRepository.save(defaultPlan);
            log.info("Seeded default plan: Premium Monthly Plan");
        }
    }

    public List<PlanDto> getActivePlans() {
        return planRepository.findByIsActiveTrue().stream()
                .map(this::mapToPlanDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createSubscription(Long userId, CreateSubscriptionRequest request) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Plan plan = planRepository.findByRazorpayPlanId(request.getRazorpayPlanId())
                .orElseThrow(() -> new IllegalArgumentException("Plan not found"));

        // Create Razorpay Subscription request
        JSONObject subscriptionRequest = new JSONObject();
        subscriptionRequest.put("plan_id", plan.getRazorpayPlanId());
        subscriptionRequest.put("total_count", request.getTotalCount() != null ? request.getTotalCount() : 12);
        subscriptionRequest.put("quantity", 1);
        subscriptionRequest.put("customer_notify", 1);

        // Call Razorpay API
        com.razorpay.Subscription razorpaySubscription;
        try {
            razorpaySubscription = razorpayClient.subscriptions.create(subscriptionRequest);
        } catch (Exception e) {
            log.error("Error creating Razorpay subscription for user: {}", userId, e);
            throw new RuntimeException("Failed to create subscription via Razorpay: " + e.getMessage());
        }

        String subId = razorpaySubscription.get("id");
        String shortUrl = razorpaySubscription.get("short_url");

        // Save local subscription with status "created"
        Subscription subscription = Subscription.builder()
                .user(user)
                .razorpaySubscriptionId(subId)
                .plan(plan)
                .status("created")
                .cancelAtPeriodEnd(false)
                .shortUrl(shortUrl)
                .build();

        subscriptionRepository.save(subscription);

        // Prepare configuration map for the frontend Razorpay checkout widget
        Map<String, Object> checkoutConfig = new HashMap<>();
        checkoutConfig.put("subscriptionId", subId);
        checkoutConfig.put("razorpayKeyId", razorpayKeyId);
        checkoutConfig.put("planName", plan.getName());
        checkoutConfig.put("amount", plan.getAmount().multiply(new BigDecimal("100")).intValue()); // in paise
        checkoutConfig.put("currency", plan.getCurrency());
        checkoutConfig.put("userName", user.getName());
        checkoutConfig.put("userEmail", user.getEmail());
        checkoutConfig.put("userMobile", user.getMobile());

        return checkoutConfig;
    }

    @Transactional
    public boolean verifySubscription(Long userId, SubscriptionVerifyRequest request) {
        log.info("Verifying subscription: {} for user: {}", request.getRazorpaySubscriptionId(), userId);

        Subscription subscription = subscriptionRepository.findByRazorpaySubscriptionId(request.getRazorpaySubscriptionId())
                .orElseThrow(() -> new IllegalArgumentException("Subscription record not found"));

        if (!subscription.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized verification request");
        }

        // Verify Razorpay signature using SDK Utils
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_subscription_id", request.getRazorpaySubscriptionId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifySubscription(options, razorpayKeySecret);
            if (!isValid) {
                log.error("Razorpay subscription signature verification failed.");
                return false;
            }
        } catch (Exception e) {
            log.error("Signature verification helper threw exception", e);
            return false;
        }

        // Update local subscription to active
        subscription.setStatus("active");
        subscription.setCurrentPeriodStart(LocalDateTime.now());
        subscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
        subscriptionRepository.save(subscription);

        // Record the transaction
        PaymentTransaction transaction = PaymentTransaction.builder()
                .subscription(subscription)
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .amount(subscription.getPlan().getAmount())
                .status("captured")
                .build();
        paymentTransactionRepository.save(transaction);

        log.info("Subscription verified and marked active: {}", subscription.getRazorpaySubscriptionId());
        return true;
    }

    @Transactional
    public SubscriptionDto cancelSubscription(Long userId) throws Exception {
        // Find latest active subscription
        Subscription subscription = subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                userId, List.of("active", "authenticated", "pending")
        ).orElseThrow(() -> new IllegalArgumentException("No active subscription found"));

        // Call Razorpay API to cancel at cycle end
        JSONObject cancelRequest = new JSONObject();
        cancelRequest.put("cancel_at_cycle_end", 1);

        try {
            razorpayClient.subscriptions.cancel(subscription.getRazorpaySubscriptionId(), cancelRequest);
        } catch (Exception e) {
            log.error("Error cancelling subscription via Razorpay API: {}", subscription.getRazorpaySubscriptionId(), e);
            throw new RuntimeException("Failed to cancel subscription via Razorpay: " + e.getMessage());
        }

        subscription.setCancelAtPeriodEnd(true);
        subscriptionRepository.save(subscription);

        log.info("Subscription flagged to cancel at period end: {}", subscription.getRazorpaySubscriptionId());
        return mapToSubscriptionDto(subscription);
    }

    public SubscriptionDto getActiveSubscription(Long userId) {
        return subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                userId, List.of("active", "authenticated", "pending")
        ).map(this::mapToSubscriptionDto).orElse(null);
    }

    public List<PaymentTransactionDto> getPaymentHistory(Long userId) {
        List<Subscription> subscriptions = subscriptionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<PaymentTransactionDto> transactions = new ArrayList<>();

        for (Subscription sub : subscriptions) {
            List<PaymentTransaction> list = paymentTransactionRepository.findBySubscriptionIdOrderByCreatedAtDesc(sub.getId());
            for (PaymentTransaction tx : list) {
                transactions.add(mapToPaymentTransactionDto(tx));
            }
        }
        return transactions;
    }

    @Transactional
    public void handleWebhookEvent(String eventType, JSONObject payload) {
        log.info("Handling webhook event: {}", eventType);
        JSONObject subscriptionWrapper = payload.optJSONObject("subscription");
        if (subscriptionWrapper == null) {
            log.warn("No subscription object in webhook payload");
            return;
        }

        JSONObject subscriptionPayload = subscriptionWrapper.optJSONObject("entity");
        if (subscriptionPayload == null) {
            log.warn("No subscription entity inside subscription wrapper in webhook payload");
            return;
        }

        String subId = subscriptionPayload.optString("id");
        if (subId == null || subId.isEmpty()) {
            log.warn("Subscription ID missing in webhook payload");
            return;
        }

        Optional<Subscription> optSub = subscriptionRepository.findByRazorpaySubscriptionId(subId);
        if (optSub.isEmpty()) {
            log.warn("Subscription not found locally for ID: {}", subId);
            return;
        }

        Subscription subscription = optSub.get();

        switch (eventType) {
            case "subscription.authenticated":
                subscription.setStatus("authenticated");
                subscriptionRepository.save(subscription);
                log.info("Webhook handled [subscription.authenticated] for: {}", subId);
                break;

            case "subscription.charged":
                subscription.setStatus("active");
                Long startEpoch = subscriptionPayload.optLong("current_start");
                Long endEpoch = subscriptionPayload.optLong("current_end");
                if (startEpoch > 0) {
                    subscription.setCurrentPeriodStart(epochToLocalDateTime(startEpoch));
                }
                if (endEpoch > 0) {
                    subscription.setCurrentPeriodEnd(epochToLocalDateTime(endEpoch));
                }
                subscriptionRepository.save(subscription);

                // Record transaction
                JSONObject paymentWrapper = payload.optJSONObject("payment");
                JSONObject paymentPayload = paymentWrapper != null ? paymentWrapper.optJSONObject("entity") : null;
                String payId = paymentPayload != null ? paymentPayload.optString("id") : "webhook_tx_" + UUID.randomUUID().toString().substring(0, 8);
                BigDecimal amount = BigDecimal.ZERO;
                if (paymentPayload != null && paymentPayload.has("amount")) {
                    amount = BigDecimal.valueOf(paymentPayload.optDouble("amount") / 100.0);
                } else {
                    amount = subscription.getPlan().getAmount();
                }

                String method = paymentPayload != null ? paymentPayload.optString("method") : "unknown";

                PaymentTransaction transaction = PaymentTransaction.builder()
                        .subscription(subscription)
                        .razorpayPaymentId(payId)
                        .amount(amount)
                        .status("captured")
                        .paymentMethod(method)
                        .build();
                paymentTransactionRepository.save(transaction);
                log.info("Webhook handled [subscription.charged] for: {}, recorded TX: {}", subId, payId);
                break;

            case "subscription.cancelled":
                subscription.setStatus("cancelled");
                subscriptionRepository.save(subscription);
                log.info("Webhook handled [subscription.cancelled] for: {}", subId);
                break;

            case "subscription.paused":
                subscription.setStatus("paused");
                subscriptionRepository.save(subscription);
                log.info("Webhook handled [subscription.paused] for: {}", subId);
                break;

            case "subscription.resumed":
                subscription.setStatus("active");
                subscriptionRepository.save(subscription);
                log.info("Webhook handled [subscription.resumed] for: {}", subId);
                break;

            case "subscription.halted":
                subscription.setStatus("halted");
                subscriptionRepository.save(subscription);
                log.info("Webhook handled [subscription.halted] for: {}", subId);
                break;

            case "subscription.completed":
                subscription.setStatus("completed");
                subscriptionRepository.save(subscription);
                log.info("Webhook handled [subscription.completed] for: {}", subId);
                break;

            case "payment.failed":
                subscription.setStatus("past_due");
                subscriptionRepository.save(subscription);

                JSONObject failPaymentWrapper = payload.optJSONObject("payment");
                JSONObject failPayment = failPaymentWrapper != null ? failPaymentWrapper.optJSONObject("entity") : null;
                String failPayId = failPayment != null ? failPayment.optString("id") : "fail_tx_" + UUID.randomUUID().toString().substring(0, 8);
                BigDecimal failAmount = BigDecimal.ZERO;
                if (failPayment != null && failPayment.has("amount")) {
                    failAmount = BigDecimal.valueOf(failPayment.optDouble("amount") / 100.0);
                } else {
                    failAmount = subscription.getPlan().getAmount();
                }
                String failMethod = failPayment != null ? failPayment.optString("method") : "unknown";
                String errorCode = failPayment != null ? failPayment.optString("error_code") : "unknown_error";
                String errorDesc = failPayment != null ? failPayment.optString("error_description") : "unknown failure details";

                PaymentTransaction failTx = PaymentTransaction.builder()
                        .subscription(subscription)
                        .razorpayPaymentId(failPayId)
                        .amount(failAmount)
                        .status("failed")
                        .paymentMethod(failMethod)
                        .errorCode(errorCode)
                        .errorDescription(errorDesc)
                        .build();
                paymentTransactionRepository.save(failTx);
                log.warn("Webhook handled [payment.failed] for subscription: {}, recorded failed TX: {}", subId, failPayId);
                break;

            default:
                log.warn("Unhandled webhook event type: {}", eventType);
                break;
        }
    }

    private LocalDateTime epochToLocalDateTime(Long epoch) {
        if (epoch == null || epoch == 0) return null;
        return LocalDateTime.ofInstant(Instant.ofEpochSecond(epoch), ZoneId.of("Asia/Kolkata"));
    }

    private PlanDto mapToPlanDto(Plan plan) {
        return PlanDto.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .amount(plan.getAmount())
                .currency(plan.getCurrency())
                .billingInterval(plan.getBillingInterval())
                .razorpayPlanId(plan.getRazorpayPlanId())
                .build();
    }

    private SubscriptionDto mapToSubscriptionDto(Subscription sub) {
        return SubscriptionDto.builder()
                .id(sub.getId())
                .razorpaySubscriptionId(sub.getRazorpaySubscriptionId())
                .planName(sub.getPlan().getName())
                .status(sub.getStatus())
                .currentPeriodStart(sub.getCurrentPeriodStart())
                .currentPeriodEnd(sub.getCurrentPeriodEnd())
                .cancelAtPeriodEnd(sub.getCancelAtPeriodEnd())
                .shortUrl(sub.getShortUrl())
                .createdAt(sub.getCreatedAt())
                .build();
    }

    private PaymentTransactionDto mapToPaymentTransactionDto(PaymentTransaction tx) {
        return PaymentTransactionDto.builder()
                .id(tx.getId())
                .razorpayPaymentId(tx.getRazorpayPaymentId())
                .razorpayOrderId(tx.getRazorpayOrderId())
                .amount(tx.getAmount())
                .status(tx.getStatus())
                .paymentMethod(tx.getPaymentMethod())
                .errorCode(tx.getErrorCode())
                .errorDescription(tx.getErrorDescription())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
