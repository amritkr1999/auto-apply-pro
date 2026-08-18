package com.backend.autoapplypro.modules.govt_exams.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrepMaterialDto {
    private UUID id;
    private String subjectTag;
    private String title;
    private String resourceType;
    private String url;
    private String providerName;
}
