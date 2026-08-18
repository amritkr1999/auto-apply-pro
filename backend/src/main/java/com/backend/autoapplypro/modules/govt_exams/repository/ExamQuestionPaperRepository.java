package com.backend.autoapplypro.modules.govt_exams.repository;

import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import com.backend.autoapplypro.modules.govt_exams.model.ExamQuestionPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExamQuestionPaperRepository extends JpaRepository<ExamQuestionPaper, UUID> {

    @Query("SELECT q FROM ExamQuestionPaper q WHERE " +
           "(:category IS NULL OR q.examCategory = :category) AND " +
           "(:year IS NULL OR q.year = :year) " +
           "ORDER BY q.year DESC, q.examName ASC")
    List<ExamQuestionPaper> searchQuestionPapers(
            @Param("category") ExamCategory category,
            @Param("year") Integer year
    );
}
