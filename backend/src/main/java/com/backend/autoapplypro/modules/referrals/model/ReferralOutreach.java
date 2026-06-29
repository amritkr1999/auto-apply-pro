package com.backend.autoapplypro.modules.referrals.model;

import com.backend.autoapplypro.modules.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "referral_outreach")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"referralRequest", "recipient"})
public class ReferralOutreach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referral_request_id", nullable = false)
    private ReferralRequest referralRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(nullable = false)
    private String status;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }
}
