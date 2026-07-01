package com.backend.autoapplypro.modules.jobs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationStatsDto {
    private long totalApplications;
    private long activeInterviews;
    private long offersReceived;
    private long rejectionsCount;
    private double overallResponseRate;
    private Map<String, Double> platformResponseRates;
    private Map<String, Long> platformApplicationsCount;
}
