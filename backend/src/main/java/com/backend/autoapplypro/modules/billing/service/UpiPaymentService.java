package com.backend.autoapplypro.modules.billing.service;

import com.backend.autoapplypro.modules.billing.model.UpiPaymentStatus;
import com.backend.autoapplypro.modules.billing.model.UpiPaymentTransaction;
import com.backend.autoapplypro.modules.billing.repository.UpiPaymentTransactionRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserRole;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UpiPaymentService {

    private final UpiPaymentTransactionRepository upiPaymentTransactionRepository;
    private final UserRepository userRepository;
    private final TelegramBotService telegramBotService;
    private final com.backend.autoapplypro.modules.referral_program.service.ReferralProgramService referralProgramService;

    /**
     * Submits a new UTR reference for manual verification.
     */
    @Transactional
    public UpiPaymentTransaction submitUtr(User user, String utrNumber, BigDecimal amount) {
        if (utrNumber == null || !utrNumber.trim().matches("^[0-9]{12}$")) {
            throw new IllegalArgumentException("UTR number must be exactly 12 digits.");
        }

        String cleanedUtr = utrNumber.trim();
        if (upiPaymentTransactionRepository.existsByUtrNumber(cleanedUtr)) {
            throw new IllegalArgumentException("This UTR number has already been submitted for verification.");
        }

        BigDecimal finalAmount = (amount != null && amount.compareTo(BigDecimal.ZERO) > 0) ? amount : new BigDecimal("499.00");

        UpiPaymentTransaction transaction = UpiPaymentTransaction.builder()
                .user(user)
                .utrNumber(cleanedUtr)
                .amount(finalAmount)
                .status(UpiPaymentStatus.PENDING)
                .build();

        transaction = upiPaymentTransactionRepository.save(transaction);
        log.info("Saved pending UPI payment transaction ID {} for user ID {}", transaction.getId(), user.getId());

        // Send Telegram alert to admin
        Integer messageId = telegramBotService.sendPaymentNotification(transaction);
        if (messageId != null) {
            transaction.setTelegramMessageId(messageId);
            upiPaymentTransactionRepository.save(transaction);
        }

        return transaction;
    }

    /**
     * Handles Telegram Bot callback queries when admin taps Approve or Reject inline buttons.
     */
    @Transactional
    public String handleTelegramCallback(Map<String, Object> update) {
        if (update == null || !update.containsKey("callback_query")) {
            return "OK";
        }

        try {
            Map<?, ?> callbackQuery = (Map<?, ?>) update.get("callback_query");
            String callbackQueryId = (String) callbackQuery.get("id");
            String data = (String) callbackQuery.get("data");

            Map<?, ?> message = (Map<?, ?>) callbackQuery.get("message");
            Integer messageId = message != null ? ((Number) message.get("message_id")).intValue() : null;
            Map<?, ?> chat = message != null ? (Map<?, ?>) message.get("chat") : null;
            String chatId = chat != null ? String.valueOf(chat.get("id")) : null;

            if (data == null || (!data.startsWith("approve_") && !data.startsWith("reject_"))) {
                return "OK";
            }

            boolean isApprove = data.startsWith("approve_");
            Long txId = Long.parseLong(data.substring(data.indexOf('_') + 1));

            Optional<UpiPaymentTransaction> txOpt = upiPaymentTransactionRepository.findById(txId);
            if (txOpt.isEmpty()) {
                telegramBotService.answerCallbackQuery(callbackQueryId, "⚠️ Transaction not found.");
                return "OK";
            }

            UpiPaymentTransaction transaction = txOpt.get();

            if (transaction.getStatus() != UpiPaymentStatus.PENDING) {
                String existingStatus = transaction.getStatus().name();
                telegramBotService.answerCallbackQuery(callbackQueryId, "⚠️ Already processed: " + existingStatus);
                return "OK";
            }

            User user = transaction.getUser();

            if (isApprove) {
                transaction.setStatus(UpiPaymentStatus.APPROVED);
                user.setIsPremium(true);
                user.setRole(UserRole.PRO);
                userRepository.save(user);

                // Trigger referral program reward conversion if user was referred
                try {
                    referralProgramService.processSubscriptionConversion(user.getId());
                } catch (Exception e) {
                    log.error("Failed to process referral conversion for user {}: {}", user.getId(), e.getMessage());
                }

                upiPaymentTransactionRepository.save(transaction);

                String updatedText = String.format(
                        "✅ *Payment Approved!*\n\n" +
                        "👤 *User:* %s (%s)\n" +
                        "🆔 *User ID:* %d\n" +
                        "🔢 *UTR Number:* `%s`\n" +
                        "💰 *Amount:* ₹%.2f\n" +
                        "🎉 *Account Status:* UPGRADED TO PRO",
                        user.getName(), user.getEmail(), user.getId(),
                        transaction.getUtrNumber(), transaction.getAmount()
                );

                telegramBotService.editMessage(chatId, messageId, updatedText);
                telegramBotService.answerCallbackQuery(callbackQueryId, "✅ Approved! User upgraded to PRO.");
                log.info("Payment transaction {} APPROVED via Telegram callback. User {} upgraded to PRO.", txId, user.getEmail());
            } else {
                transaction.setStatus(UpiPaymentStatus.REJECTED);
                upiPaymentTransactionRepository.save(transaction);

                String updatedText = String.format(
                        "❌ *Payment Rejected*\n\n" +
                        "👤 *User:* %s (%s)\n" +
                        "🆔 *User ID:* %d\n" +
                        "🔢 *UTR Number:* `%s`\n" +
                        "💰 *Amount:* ₹%.2f\n" +
                        "⚠️ *Status:* REJECTED",
                        user.getName(), user.getEmail(), user.getId(),
                        transaction.getUtrNumber(), transaction.getAmount()
                );

                telegramBotService.editMessage(chatId, messageId, updatedText);
                telegramBotService.answerCallbackQuery(callbackQueryId, "❌ Payment Rejected.");
                log.info("Payment transaction {} REJECTED via Telegram callback.", txId);
            }

        } catch (Exception e) {
            log.error("Error processing Telegram callback: {}", e.getMessage(), e);
        }

        return "OK";
    }

    /**
     * Retrieves the latest transaction status for a user.
     */
    public Optional<UpiPaymentTransaction> getLatestUserTransaction(Long userId) {
        return upiPaymentTransactionRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
    }
}
