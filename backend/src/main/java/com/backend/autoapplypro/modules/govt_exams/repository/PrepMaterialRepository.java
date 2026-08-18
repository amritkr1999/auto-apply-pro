package com.backend.autoapplypro.modules.govt_exams.repository;

import com.backend.autoapplypro.modules.govt_exams.model.PrepMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PrepMaterialRepository extends JpaRepository<PrepMaterial, UUID> {
    List<PrepMaterial> findBySubjectTagIgnoreCase(String subjectTag);
    List<PrepMaterial> findBySubjectTagInIgnoreCase(List<String> subjectTags);
}
