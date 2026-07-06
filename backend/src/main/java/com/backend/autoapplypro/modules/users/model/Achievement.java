package com.backend.autoapplypro.modules.users.model;

import com.backend.autoapplypro.modules.users.public_profile.dto.AchievementCard;
import com.backend.autoapplypro.modules.users.public_profile.evidence.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "achievements")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
public class Achievement extends AchievementCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.NONE;

    @Column(name = "is_oauth_source", nullable = false)
    @Builder.Default
    private Boolean isOauthSource = false;

    @Column(name = "is_document_ai_verified", nullable = false)
    @Builder.Default
    private Boolean isDocumentAiVerified = false;

    @Column(name = "is_reference_check_confirmed", nullable = false)
    @Builder.Default
    private Boolean isReferenceCheckConfirmed = false;
}
