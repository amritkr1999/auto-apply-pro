package com.backend.autoapplypro.modules.outreach.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "email_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailTemplate {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String intro;

    @Column(name = "skills_template", columnDefinition = "TEXT")
    private String skillsTemplate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(name = "sign_off", columnDefinition = "TEXT")
    private String signOff;

    @Column(name = "creator_id")
    private Long creatorId;

    @Builder.Default
    @Column(name = "is_system_template")
    private Boolean isSystemTemplate = false;

    @Builder.Default
    @Column(name = "is_public")
    private Boolean isPublic = true;

    @org.hibernate.annotations.Formula("(select coalesce(avg(r.rating), 0.0) from template_ratings r where r.template_id = id)")
    private Double averageRating;

    @Transient
    @Builder.Default
    private Boolean isFavorited = false;

    @Transient
    private Integer userRating;
}
