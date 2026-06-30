package com.backend.autoapplypro.modules.learning.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitResponseDto {
    private boolean correct;
    private String correctAnswer;
    private String explanation;
}
