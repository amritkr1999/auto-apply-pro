package com.backend.autoapplypro.modules.users.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MarketingCampaignScheduler {

    private final MarketingEmailCampaignService campaignService;

    // Run every day at 10:00 AM
    @Scheduled(cron = "0 0 10 * * ?")
    public void executeMarketingDrips() {
        log.info("Starting daily scheduled marketing campaign drip checks...");
        try {
            campaignService.runDripCampaign();
            log.info("Daily marketing campaign drip checks completed successfully.");
        } catch (Exception e) {
            log.error("Error occurred while running daily marketing drips", e);
        }
    }
}
