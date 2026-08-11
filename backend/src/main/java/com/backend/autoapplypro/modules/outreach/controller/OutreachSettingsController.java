package com.backend.autoapplypro.modules.outreach.controller;

import com.backend.autoapplypro.modules.outreach.dto.OutreachSettingsDto;
import com.backend.autoapplypro.modules.outreach.service.OutreachSchedulerService;
import com.backend.autoapplypro.modules.outreach.service.HrOutreachCampaignService;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/outreach/settings")
@RequiredArgsConstructor
@Slf4j
public class OutreachSettingsController {

    private final UserRepository userRepository;
    private final OutreachSchedulerService schedulerService;
    private final HrOutreachCampaignService campaignService;

    @GetMapping
    public ResponseEntity<OutreachSettingsDto> getSettings(@RequestParam("userId") Long userId) {
        log.info("Fetching outreach settings for user ID: {}", userId);
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            log.warn("User ID {} not found in database. Returning default outreach settings.", userId);
            return ResponseEntity.ok(OutreachSettingsDto.builder()
                    .dailyLimit(50)
                    .minIntervalMinutes(10)
                    .maxIntervalMinutes(30)
                    .slotStart("09:00")
                    .slotEnd("17:00")
                    .skipWeekends(true)
                    .hrOutreachCampaignEnabled(false)
                    .hrOutreachTargetRole("Software Engineer")
                    .hrOutreachTemplateId("default-1")
                    .hrOutreachSourceTable("MAIN")
                    .hrOutreachDispatchMode("DIRECT_SEND")
                    .marketingEmailsEnabled(true)
                    .aiPersonalizationEnabled(false)
                    .outreachSkillsFormat("COMMA")
                    .build());
        }

        OutreachSettingsDto dto = OutreachSettingsDto.builder()
                .dailyLimit(user.getDailyLimit() != null ? user.getDailyLimit() : 50)
                .minIntervalMinutes(user.getOutreachMinIntervalMin() != null ? user.getOutreachMinIntervalMin() : 10)
                .maxIntervalMinutes(user.getOutreachMaxIntervalMin() != null ? user.getOutreachMaxIntervalMin() : 30)
                .slotStart(user.getOutreachSlotStart() != null ? user.getOutreachSlotStart().toString() : "09:00")
                .slotEnd(user.getOutreachSlotEnd() != null ? user.getOutreachSlotEnd().toString() : "17:00")
                .timezone(user.getOutreachTimezone())
                .skipWeekends(user.getOutreachSkipWeekends() != null ? user.getOutreachSkipWeekends() : true)
                // Campaign settings
                .hrOutreachCampaignEnabled(user.getHrOutreachCampaignEnabled() != null ? user.getHrOutreachCampaignEnabled() : false)
                .hrOutreachTargetRole(user.getHrOutreachTargetRole() != null ? user.getHrOutreachTargetRole() : "Software Engineer")
                .hrOutreachTemplateId(user.getHrOutreachTemplateId() != null ? user.getHrOutreachTemplateId() : "default-1")
                .hrOutreachSourceTable(user.getHrOutreachSourceTable() != null ? user.getHrOutreachSourceTable() : "MAIN")
                .hrOutreachDispatchMode(user.getHrOutreachDispatchMode() != null ? user.getHrOutreachDispatchMode() : "DIRECT_SEND")
                .marketingEmailsEnabled(user.getMarketingEmailsEnabled() != null ? user.getMarketingEmailsEnabled() : true)
                .aiPersonalizationEnabled(user.getAiPersonalizationEnabled() != null ? user.getAiPersonalizationEnabled() : false)
                .outreachSkillsFormat(user.getOutreachSkillsFormat() != null ? user.getOutreachSkillsFormat() : "COMMA")
                .build();

        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<?> updateSettings(@RequestParam("userId") Long userId, @RequestBody OutreachSettingsDto dto) {
        log.info("Updating outreach settings for user ID: {}. Payload: {}", userId, dto);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User ID {} not found. Settings update skipped safely.", userId);
            return ResponseEntity.ok(Map.of("message", "Outreach settings processed."));
        }

        if (dto.getDailyLimit() != null) {
            user.setDailyLimit(dto.getDailyLimit());
        }

        if (dto.getMinIntervalMinutes() != null && dto.getMaxIntervalMinutes() != null) {
            if (dto.getMinIntervalMinutes() > dto.getMaxIntervalMinutes()) {
                return ResponseEntity.badRequest().body("Minimum interval cannot be greater than maximum interval.");
            }
            user.setOutreachMinIntervalMin(dto.getMinIntervalMinutes());
            user.setOutreachMaxIntervalMin(dto.getMaxIntervalMinutes());
        } else {
            if (dto.getMinIntervalMinutes() != null) {
                user.setOutreachMinIntervalMin(dto.getMinIntervalMinutes());
            }
            if (dto.getMaxIntervalMinutes() != null) {
                user.setOutreachMaxIntervalMin(dto.getMaxIntervalMinutes());
            }
        }

        try {
            if (dto.getSlotStart() != null) {
                user.setOutreachSlotStart(LocalTime.parse(dto.getSlotStart()));
            }
            if (dto.getSlotEnd() != null) {
                user.setOutreachSlotEnd(LocalTime.parse(dto.getSlotEnd()));
            }
        } catch (Exception e) {
            log.error("Failed to parse local time limits", e);
            return ResponseEntity.badRequest().body("Invalid time format. Use HH:mm format.");
        }

        if (dto.getTimezone() != null) {
            try {
                ZoneId.of(dto.getTimezone());
                user.setOutreachTimezone(dto.getTimezone());
            } catch (Exception e) {
                log.error("Invalid timezone supplied: {}", dto.getTimezone(), e);
                return ResponseEntity.badRequest().body("Invalid timezone identifier.");
            }
        }

        if (dto.getSkipWeekends() != null) {
            user.setOutreachSkipWeekends(dto.getSkipWeekends());
        }

        if (dto.getMarketingEmailsEnabled() != null) {
            user.setMarketingEmailsEnabled(dto.getMarketingEmailsEnabled());
        }

        if (dto.getAiPersonalizationEnabled() != null) {
            user.setAiPersonalizationEnabled(dto.getAiPersonalizationEnabled());
        }

        if (dto.getOutreachSkillsFormat() != null) {
            user.setOutreachSkillsFormat(dto.getOutreachSkillsFormat());
        }

        // Campaign settings logic
        boolean isCampaignToggled = dto.getHrOutreachCampaignEnabled() != null &&
                !dto.getHrOutreachCampaignEnabled().equals(user.getHrOutreachCampaignEnabled());
        
        boolean isCampaignActive = Boolean.TRUE.equals(user.getHrOutreachCampaignEnabled());
        boolean hasCampaignParamsChanged = false;
        
        if (dto.getHrOutreachTargetRole() != null && !dto.getHrOutreachTargetRole().equals(user.getHrOutreachTargetRole())) {
            user.setHrOutreachTargetRole(dto.getHrOutreachTargetRole());
            hasCampaignParamsChanged = true;
        }
        if (dto.getHrOutreachTemplateId() != null && !dto.getHrOutreachTemplateId().equals(user.getHrOutreachTemplateId())) {
            user.setHrOutreachTemplateId(dto.getHrOutreachTemplateId());
            hasCampaignParamsChanged = true;
        }
        if (dto.getHrOutreachSourceTable() != null && !dto.getHrOutreachSourceTable().equals(user.getHrOutreachSourceTable())) {
            user.setHrOutreachSourceTable(dto.getHrOutreachSourceTable());
            hasCampaignParamsChanged = true;
        }
        if (dto.getHrOutreachDispatchMode() != null) {
            user.setHrOutreachDispatchMode(dto.getHrOutreachDispatchMode());
        }

        userRepository.save(user);
        log.info("User settings saved to database.");

        // If explicitly toggled or settings changed while campaign is active, toggle/regenerate the campaign
        if (isCampaignToggled || (isCampaignActive && hasCampaignParamsChanged)) {
            boolean nextEnabled = dto.getHrOutreachCampaignEnabled() != null ? dto.getHrOutreachCampaignEnabled() : isCampaignActive;
            campaignService.toggleCampaign(user, nextEnabled, user.getHrOutreachTargetRole(), user.getHrOutreachTemplateId(), user.getHrOutreachSourceTable());
        }

        // Reschedule all pending emails for this user to align with the new intervals & window constraints
        schedulerService.reschedulePendingEmails(user);

        return ResponseEntity.ok(Map.of("message", "Outreach settings updated successfully"));
    }

    @PostMapping("/campaign/toggle")
    public ResponseEntity<?> toggleCampaign(
            @RequestParam("userId") Long userId,
            @RequestParam("enable") boolean enable) {
        log.info("Request to toggle HR outreach campaign for user ID: {} to {}", userId, enable);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        campaignService.toggleCampaign(user, enable, user.getHrOutreachTargetRole(), user.getHrOutreachTemplateId(), user.getHrOutreachSourceTable());

        return ResponseEntity.ok(Map.of(
                "enabled", enable,
                "message", "Campaign " + (enable ? "activated" : "deactivated") + " successfully"
        ));
    }
}
