package com.backend.autoapplypro.modules.referral_program.service;

import com.backend.autoapplypro.modules.referral_program.dto.ReferralDashboardDto;
import com.backend.autoapplypro.modules.referral_program.dto.ReferralRecordDto;
import com.backend.autoapplypro.modules.referral_program.dto.ReferralStatusResponseDto;
import com.backend.autoapplypro.modules.referral_program.model.ReferralProgram;
import com.backend.autoapplypro.modules.referral_program.model.ReferralRecord;
import com.backend.autoapplypro.modules.referral_program.model.ReferralStatus;
import com.backend.autoapplypro.modules.referral_program.repository.ReferralProgramRepository;
import com.backend.autoapplypro.modules.referral_program.repository.ReferralRecordRepository;
import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReferralProgramServiceImpl implements ReferralProgramService {

    private final ReferralProgramRepository programRepository;
    private final ReferralRecordRepository recordRepository;
    private final UserRepository userRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendBaseUrl;

    private static final String ALPHANUMERIC = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused chars (0, O, 1, I)
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public String generateUniqueReferralCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("REF-");
            for (int i = 0; i < 8; i++) {
                sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
            }
            code = sb.toString();
        } while (programRepository.existsByReferralCode(code));
        return code;
    }

    @Override
    @Transactional
    public ReferralProgram getOrCreateUserProgram(Long userId) {
        return programRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

            String code = user.getReferralCode();
            if (code == null || code.isBlank()) {
                code = generateUniqueReferralCode();
                user.setReferralCode(code);
                userRepository.save(user);
            }

            ReferralProgram program = ReferralProgram.builder()
                    .userId(userId)
                    .referralCode(code)
                    .totalClicks(0)
                    .totalSignups(0)
                    .totalConversions(0)
                    .earnedTrialDays(0)
                    .isEnabled(true)
                    .build();
            return programRepository.save(program);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public ReferralDashboardDto getUserDashboard(Long userId) {
        ReferralProgram program = getOrCreateUserProgram(userId);
        List<ReferralRecord> records = recordRepository.findByReferrerUserIdOrderByCreatedAtDesc(userId);

        List<ReferralRecordDto> recentReferrals = records.stream()
                .map(this::toRecordDto)
                .collect(Collectors.toList());

        String link = frontendBaseUrl + "/register?ref=" + program.getReferralCode();

        return ReferralDashboardDto.builder()
                .referralCode(program.getReferralCode())
                .referralLink(link)
                .totalClicks(program.getTotalClicks())
                .totalSignups(program.getTotalSignups())
                .totalConversions(program.getTotalConversions())
                .earnedTrialDays(program.getEarnedTrialDays())
                .comingSoon(true)
                .programStatusMessage("🚀 Referral Program Coming Soon! Preview your referral link and see how rewards will work upon launch.")
                .recentReferrals(recentReferrals)
                .build();
    }

    @Override
    @Transactional
    public void trackClick(String referralCode) {
        if (referralCode == null || referralCode.isBlank()) return;
        programRepository.findByReferralCode(referralCode.trim()).ifPresent(program -> {
            program.setTotalClicks(program.getTotalClicks() + 1);
            programRepository.save(program);
            log.info("Tracked referral link click for code: {}", referralCode);
        });
    }

    @Override
    @Transactional
    public void processReferralSignup(Long refereeUserId, String referralCode) {
        if (referralCode == null || referralCode.isBlank()) return;
        
        Optional<ReferralProgram> programOpt = programRepository.findByReferralCode(referralCode.trim());
        if (programOpt.isEmpty()) {
            log.warn("Invalid referral code used at signup: {}", referralCode);
            return;
        }

        ReferralProgram referrerProgram = programOpt.get();
        if (referrerProgram.getUserId().equals(refereeUserId)) {
            log.warn("User {} attempted to refer themselves with code {}", refereeUserId, referralCode);
            return;
        }

        if (recordRepository.findByRefereeUserId(refereeUserId).isPresent()) {
            log.warn("User {} has already been recorded as referred", refereeUserId);
            return;
        }

        ReferralRecord record = ReferralRecord.builder()
                .referrerUserId(referrerProgram.getUserId())
                .refereeUserId(refereeUserId)
                .referralCode(referralCode.trim())
                .status(ReferralStatus.PENDING)
                .rewardTrialDays(7)
                .build();

        recordRepository.save(record);

        referrerProgram.setTotalSignups(referrerProgram.getTotalSignups() + 1);
        programRepository.save(referrerProgram);
        log.info("Recorded referral signup for refereeUserId {} via code {}", refereeUserId, referralCode);
    }

    @Override
    @Transactional
    public void processSubscriptionConversion(Long refereeUserId) {
        Optional<ReferralRecord> recordOpt = recordRepository.findByRefereeUserIdAndStatus(refereeUserId, ReferralStatus.PENDING);
        if (recordOpt.isEmpty()) {
            return;
        }

        ReferralRecord record = recordOpt.get();
        record.setStatus(ReferralStatus.CONVERTED);
        record.setConvertedAt(LocalDateTime.now());
        recordRepository.save(record);

        // Update referrer stats
        programRepository.findByUserId(record.getReferrerUserId()).ifPresent(referrerProg -> {
            referrerProg.setTotalConversions(referrerProg.getTotalConversions() + 1);
            referrerProg.setEarnedTrialDays(referrerProg.getEarnedTrialDays() + 7);
            programRepository.save(referrerProg);
        });

        // Grant 7-day premium status to both referrer and referee
        userRepository.findById(record.getReferrerUserId()).ifPresent(user -> {
            user.setIsPremium(true);
            userRepository.save(user);
        });
        userRepository.findById(refereeUserId).ifPresent(user -> {
            user.setIsPremium(true);
            userRepository.save(user);
        });

        log.info("Successfully processed referral conversion for referee {}! Granted 7-day premium to referrer {} and referee.", 
                refereeUserId, record.getReferrerUserId());
    }

    @Override
    public ReferralStatusResponseDto getProgramStatus() {
        return ReferralStatusResponseDto.builder()
                .comingSoon(true)
                .title("Refer & Earn 7 Days Premium")
                .description("Invite fellow job seekers to AutoApplyPro. When they subscribe to any plan, both of you unlock 7 days of Premium features free!")
                .rewardTrialDays(7)
                .rewardTriggerCondition("First Paid Subscription Purchase")
                .build();
    }

    private ReferralRecordDto toRecordDto(ReferralRecord record) {
        String maskedEmail = "User #" + record.getRefereeUserId();
        Optional<User> refereeOpt = userRepository.findById(record.getRefereeUserId());
        if (refereeOpt.isPresent()) {
            String email = refereeOpt.get().getEmail();
            int atIndex = email.indexOf("@");
            if (atIndex > 2) {
                maskedEmail = email.substring(0, 2) + "***" + email.substring(atIndex);
            } else if (atIndex > 0) {
                maskedEmail = email.substring(0, 1) + "***" + email.substring(atIndex);
            }
        }

        return ReferralRecordDto.builder()
                .id(record.getId())
                .refereeUserId(record.getRefereeUserId())
                .refereeEmailMasked(maskedEmail)
                .referralCode(record.getReferralCode())
                .status(record.getStatus().name())
                .rewardTrialDays(record.getRewardTrialDays())
                .convertedAt(record.getConvertedAt())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
