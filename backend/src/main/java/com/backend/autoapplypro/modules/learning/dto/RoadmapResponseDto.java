package com.backend.autoapplypro.modules.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadmapResponseDto {
    private Long id;
    private String title;
    private String description;
    private String icon;
    private double progressPercentage;
    private List<RoadmapStepDto> steps;
}
