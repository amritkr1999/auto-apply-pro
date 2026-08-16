package com.backend.autoapplypro.modules.jobs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostingFeedDto {
    private Long id;
    private String title;
    private String company;
    private String location;
    private String description;
    private String requirements;
    private String salary;
    private String sourceUrl;
    private String hrEmail;
    private LocalDateTime createdAt;
    private long daysAgo;
}
