package com.backend.autoapplypro.modules.users.service;

public interface MarketingEmailCampaignService {
    void runDripCampaign();
    void sendDailyLimitExceededEmail(Long userId);
    void unsubscribeUser(String token);
}
