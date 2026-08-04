package com.backend.autoapplypro.modules.outreach.service;

import com.backend.autoapplypro.modules.outreach.dto.DailyDigestDto;
import com.backend.autoapplypro.modules.users.model.User;

import java.time.LocalDate;

public interface DailyDigestService {
    DailyDigestDto generateDailyDigest(User user, LocalDate date);
    String buildDailyDigestHtml(DailyDigestDto digest);
    boolean sendDailyDigestForUser(User user, LocalDate date);
}
