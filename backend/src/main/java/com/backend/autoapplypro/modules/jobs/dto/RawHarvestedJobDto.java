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
public class RawHarvestedJobDto {
    private Long id;
    private String rawText;
    private LocalDateTime createdAt;
}
