package com.backend.autoapplypro.modules.outreach.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutreachSettingsDto {
    private Integer dailyLimit;
    private Integer minIntervalMinutes;
    private Integer maxIntervalMinutes;
    private String slotStart; // e.g. "09:00"
    private String slotEnd;   // e.g. "17:00"
    private String timezone;  // e.g. "America/New_York"
    private Boolean skipWeekends;
}
