package com.backend.autoapplypro.modules.billing.service;

import com.backend.autoapplypro.modules.billing.model.UpiPaymentTransaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class TelegramBotService {

    @Value("${telegram.bot.token:8846804717:AAFCrsUlvReLai3W4m_Bb5jWYDglagMMI48}")
    private String botToken;

    @Value("${telegram.admin.chat-id:6023053509}")
    private String adminChatId;

    private final RestTemplate restTemplate;

    public TelegramBotService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Sends a payment verification notification to the admin Telegram chat with inline Approve/Reject buttons.
     *
     * @param transaction the UPI payment transaction
     * @return messageId returned by Telegram API, or null if failed
     */
    public Integer sendPaymentNotification(UpiPaymentTransaction transaction) {
        if (botToken == null || botToken.isBlank() || adminChatId == null || adminChatId.isBlank()) {
            log.warn("Telegram bot token or admin chat ID missing. Skipping Telegram notification.");
            return null;
        }

        String apiUrl = "https://api.telegram.org/bot" + botToken.trim() + "/sendMessage";

        String messageText = String.format(
                "💳 *New Payment Submission!*\n\n" +
                "👤 *User:* %s (%s)\n" +
                "🆔 *User ID:* %d\n" +
                "🔢 *UTR Number:* `%s`\n" +
                "💰 *Amount:* ₹%.2f\n" +
                "⌛ *Status:* PENDING_VERIFICATION",
                transaction.getUser().getName(),
                transaction.getUser().getEmail(),
                transaction.getUser().getId(),
                transaction.getUtrNumber(),
                transaction.getAmount()
        );

        Map<String, Object> approveBtn = Map.of(
                "text", "✅ Approve",
                "callback_data", "approve_" + transaction.getId()
        );
        Map<String, Object> rejectBtn = Map.of(
                "text", "❌ Reject",
                "callback_data", "reject_" + transaction.getId()
        );

        Map<String, Object> inlineKeyboard = Map.of(
                "inline_keyboard", List.of(List.of(approveBtn, rejectBtn))
        );

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("chat_id", adminChatId.trim());
        requestBody.put("text", messageText);
        requestBody.put("parse_mode", "Markdown");
        requestBody.put("reply_markup", inlineKeyboard);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            Map<?, ?> response = restTemplate.postForObject(apiUrl, entity, Map.class);
            if (response != null && Boolean.TRUE.equals(response.get("ok"))) {
                Map<?, ?> result = (Map<?, ?>) response.get("result");
                if (result != null && result.get("message_id") != null) {
                    Integer msgId = ((Number) result.get("message_id")).intValue();
                    log.info("Telegram notification sent successfully. Message ID: {}", msgId);
                    return msgId;
                }
            }
            log.warn("Telegram API response was not OK: {}", response);
        } catch (Exception e) {
            log.error("Failed to send Telegram notification: {}", e.getMessage(), e);
        }
        return null;
    }

    /**
     * Edits an existing Telegram message to reflect approval or rejection status.
     */
    public void editMessage(String chatId, Integer messageId, String newText) {
        if (botToken == null || botToken.isBlank() || chatId == null || messageId == null) {
            return;
        }

        String apiUrl = "https://api.telegram.org/bot" + botToken.trim() + "/editMessageText";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("chat_id", chatId);
        requestBody.put("message_id", messageId);
        requestBody.put("text", newText);
        requestBody.put("parse_mode", "Markdown");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            restTemplate.postForObject(apiUrl, entity, Map.class);
            log.info("Successfully updated Telegram message ID {} in chat {}", messageId, chatId);
        } catch (Exception e) {
            log.error("Failed to edit Telegram message ID {}: {}", messageId, e.getMessage(), e);
        }
    }

    /**
     * Answers callback query to stop the loading spinner on Telegram UI button.
     */
    public void answerCallbackQuery(String callbackQueryId, String text) {
        if (botToken == null || botToken.isBlank() || callbackQueryId == null) {
            return;
        }

        String apiUrl = "https://api.telegram.org/bot" + botToken.trim() + "/answerCallbackQuery";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("callback_query_id", callbackQueryId);
        requestBody.put("text", text);
        requestBody.put("show_alert", true);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            restTemplate.postForObject(apiUrl, entity, Map.class);
        } catch (Exception e) {
            log.error("Failed to answer Telegram callback query: {}", e.getMessage(), e);
        }
    }
}
