package com.backend.autoapplypro.modules.outreach.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateRatingRequest {
    private Integer rating;
    private String comment;
}
