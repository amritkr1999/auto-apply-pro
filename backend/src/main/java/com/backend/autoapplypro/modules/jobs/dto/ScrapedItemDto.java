package com.backend.autoapplypro.modules.jobs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScrapedItemDto {
    private String title;
    private String company;
    private String location;
    private String description;
    private String requirements;
    private String salary;
    private String sourceUrl;
    private String hrName;
    private String hrEmail;
    private String hrPhone;
    private String hrTitle;
    private String applyUrl;
    private String rawText;
}
