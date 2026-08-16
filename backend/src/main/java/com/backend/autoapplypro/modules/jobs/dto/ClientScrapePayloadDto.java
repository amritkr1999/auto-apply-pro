package com.backend.autoapplypro.modules.jobs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientScrapePayloadDto {
    private String clientNodeId;
    private String sourcePortal; // e.g. "Naukri", "LinkedIn", "Indeed"
    private List<ScrapedItemDto> items;
}
