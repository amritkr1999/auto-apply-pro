package com.backend.autoapplypro.modules.learning.dto;

import com.backend.autoapplypro.modules.learning.model.DailyTip;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyContentDto {
    private DailyTip tip;
    private PracticeQuestionDto question;
}
