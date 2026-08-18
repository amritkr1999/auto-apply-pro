package com.backend.autoapplypro.modules.govt_exams.repository;

import com.backend.autoapplypro.modules.govt_exams.model.ExamSyllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExamSyllabusRepository extends JpaRepository<ExamSyllabus, UUID> {
    List<ExamSyllabus> findByExamId(UUID examId);
}
