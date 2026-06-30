package com.backend.autoapplypro.modules.learning.dto;

import com.backend.autoapplypro.modules.learning.model.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceDto {
    private Long id;
    private String title;
    private String url;
    private ResourceType type;
    private String description;
    private boolean completed;
}
