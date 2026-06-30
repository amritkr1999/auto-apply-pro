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
public class TopicResponseDto {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private List<TopicResponseDto> subtopics;
}
