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
public class RoadmapStepDto {
    private Long id;
    private int stepOrder;
    private String title;
    private String description;
    private double progressPercentage;
    private List<TopicResponseDto> topics;
}
