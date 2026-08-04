package com.backend.autoapplypro.modules.outreach.dto;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialEmailRequestDto {
    private String templateId;
    private String subject;
    private String intro;
    private String skillsTemplate;
    private String body;
    private String signOff;
    private String targetEmail;
    private Map<String, String> sampleData;
}
