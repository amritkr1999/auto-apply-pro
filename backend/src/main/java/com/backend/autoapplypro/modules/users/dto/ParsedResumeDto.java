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
public class ParsedResumeDto {
    private String name;
    private String email;
    private String phone;
    private String location;
    private List<String> skills;
    private List<Map<String, Object>> experience;
    private List<Map<String, Object>> education;
    private List<String> certifications;
    private String summary;
}
