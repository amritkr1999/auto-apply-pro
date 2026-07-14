package com.backend.autoapplypro.modules.users.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaqueCardDto {
    private Long id;
    private Map<String, Object> themeConfig;
    private Map<String, Object> settings;
    private List<Map<String, Object>> elements;
}
