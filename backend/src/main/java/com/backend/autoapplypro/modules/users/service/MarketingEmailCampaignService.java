package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.model.User;

public interface MarketingEmailCampaignService {
    void runDripCampaign();
    void sendDailyLimitExceededEmail(Long userId);
    void unsubscribeUser(String token);
    void sendWelcomeEmail(User user);
}

