package com.backend.autoapplypro.modules.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyActivityDto {
    private String date; // Format: "Mon", "Tue" or date string
    private String fullDate; // Format: "YYYY-MM-DD"
    private int emailsSent;
    private int questionsSolved;
    private int topicsCompleted;
}
