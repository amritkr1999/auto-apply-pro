package com.backend.autoapplypro.modules.govt_exams.repository;

import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import com.backend.autoapplypro.modules.govt_exams.model.ExamPyq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExamPyqRepository extends JpaRepository<ExamPyq, UUID> {

    @Query("SELECT p FROM ExamPyq p WHERE " +
           "(:category IS NULL OR p.examCategory = :category) AND " +
           "(:subjectTag IS NULL OR LOWER(p.subjectTag) LIKE LOWER(CONCAT('%', :subjectTag, '%'))) " +
           "ORDER BY p.createdAt DESC")
    List<ExamPyq> searchPyqs(
            @Param("category") ExamCategory category,
            @Param("subjectTag") String subjectTag
    );
}
