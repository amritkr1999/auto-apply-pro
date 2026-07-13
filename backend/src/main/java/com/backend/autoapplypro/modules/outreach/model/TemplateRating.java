package com.backend.autoapplypro.modules.outreach.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "template_ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateRating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_id", nullable = false)
    private String templateId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;
}
