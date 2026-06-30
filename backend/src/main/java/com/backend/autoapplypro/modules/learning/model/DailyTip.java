package com.backend.autoapplypro.modules.learning.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "daily_tips")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyTip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
}
