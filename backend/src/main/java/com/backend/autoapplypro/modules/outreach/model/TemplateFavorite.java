package com.backend.autoapplypro.modules.outreach.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "template_favorites")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_id", nullable = false)
    private String templateId;

    @Column(name = "user_id", nullable = false)
    private Long userId;
}
