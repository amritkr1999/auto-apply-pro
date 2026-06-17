package com.backend.autoapplypro.modules.outreach.model;

import com.backend.autoapplypro.modules.outreach.config.EncryptionConverter;
import com.backend.autoapplypro.modules.users.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gmail_credentials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
public class GmailCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "access_token", columnDefinition = "TEXT")
    @Convert(converter = EncryptionConverter.class)
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    @Convert(converter = EncryptionConverter.class)
    private String refreshToken;

    @Column(name = "token_expiry")
    private LocalDateTime tokenExpiry;

    @Column(name = "connected_email")
    private String connectedEmail;
}
