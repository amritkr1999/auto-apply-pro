package com.backend.autoapplypro.modules.jobs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDetailsDto {
    private String title;
    private String company;
    private String location;
    private String description;
    private String requirements;
    private String salary;
    private String sourceUrl;
    private java.util.List<String> skills;

    @JsonProperty("hr_email")
    private String hrEmail;
    private String status;
}
