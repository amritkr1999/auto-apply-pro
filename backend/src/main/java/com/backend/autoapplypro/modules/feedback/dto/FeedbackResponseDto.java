package com.backend.autoapplypro.modules.feedback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDto {
    private Long id;
    private Integer rating;
    private String comment;
    private String userName;
    private String userRole;
    private LocalDateTime createdAt;
}
