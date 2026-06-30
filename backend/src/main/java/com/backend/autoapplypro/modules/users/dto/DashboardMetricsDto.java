package com.backend.autoapplypro.modules.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMetricsDto {
    private int loginStreak;
    private String lastLoginDate;
    private int totalEmailsSent;
    private int totalQuestionsSolved;
    private int totalTopicsCompleted;
    private List<DailyActivityDto> dailyActivity;
}
