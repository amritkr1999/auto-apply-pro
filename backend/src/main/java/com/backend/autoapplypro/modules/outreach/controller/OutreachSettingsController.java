package com.backend.autoapplypro.modules.outreach.controller;

import com.backend.autoapplypro.modules.outreach.dto.OutreachSettingsDto;
import com.backend.autoapplypro.modules.outreach.service.OutreachSchedulerService;
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
@CrossOrigin(origins = "*")
public class OutreachSettingsController {

    private final UserRepository userRepository;
    private final OutreachSchedulerService schedulerService;

    @GetMapping
    public ResponseEntity<OutreachSettingsDto> getSettings(@RequestParam("userId") Long userId) {
        log.info("Fetching outreach settings for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        OutreachSettingsDto dto = OutreachSettingsDto.builder()
                .dailyLimit(user.getDailyLimit() != null ? user.getDailyLimit() : 50)
                .minIntervalMinutes(user.getOutreachMinIntervalMin() != null ? user.getOutreachMinIntervalMin() : 10)
                .maxIntervalMinutes(user.getOutreachMaxIntervalMin() != null ? user.getOutreachMaxIntervalMin() : 30)
                .slotStart(user.getOutreachSlotStart() != null ? user.getOutreachSlotStart().toString() : "09:00")
                .slotEnd(user.getOutreachSlotEnd() != null ? user.getOutreachSlotEnd().toString() : "17:00")
                .timezone(user.getOutreachTimezone() != null ? user.getOutreachTimezone() : "UTC")
                .skipWeekends(user.getOutreachSkipWeekends() != null ? user.getOutreachSkipWeekends() : true)
                .build();

        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<?> updateSettings(@RequestParam("userId") Long userId, @RequestBody OutreachSettingsDto dto) {
        log.info("Updating outreach settings for user ID: {}. Payload: {}", userId, dto);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

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

        userRepository.save(user);
        log.info("User settings saved to database. Triggering reschedule for pending queue items.");

        // Reschedule all pending emails for this user to align with the new intervals & window constraints
        schedulerService.reschedulePendingEmails(user);

        return ResponseEntity.ok(Map.of("message", "Outreach settings updated successfully"));
    }
}
