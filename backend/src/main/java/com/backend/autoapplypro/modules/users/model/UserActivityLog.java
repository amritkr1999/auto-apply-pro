package com.backend.autoapplypro.modules.users.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activity_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
public class UserActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "activity_type", nullable = false)
    private String activityType; // "LOGIN", "EMAIL_SENT", "QUESTION_SOLVED", "TOPIC_COMPLETED"

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "reference_id")
    private Long referenceId; // e.g. question_id, topic_id, email_id

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (activityDate == null) {
            activityDate = LocalDate.now();
        }
    }
}
