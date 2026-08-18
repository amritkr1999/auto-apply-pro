package com.backend.autoapplypro.modules.govt_exams.repository;

import com.backend.autoapplypro.modules.govt_exams.model.ExamCategory;
import com.backend.autoapplypro.modules.govt_exams.model.ExamNotification;
import com.backend.autoapplypro.modules.govt_exams.model.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExamNotificationRepository extends JpaRepository<ExamNotification, UUID> {

    Optional<ExamNotification> findByExamNameAndOrganizingBody(String examName, String organizingBody);

    List<ExamNotification> findByCategoryOrderByApplicationEndDateAsc(ExamCategory category);

    List<ExamNotification> findByStatusOrderByApplicationEndDateAsc(ExamStatus status);

    @Query("SELECT e FROM ExamNotification e WHERE " +
           "(:category IS NULL OR e.category = :category) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:query IS NULL OR LOWER(e.examName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(e.organizingBody) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY e.applicationEndDate ASC")
    List<ExamNotification> searchNotifications(
            @Param("category") ExamCategory category,
            @Param("status") ExamStatus status,
            @Param("query") String query
    );

    List<ExamNotification> findByApplicationEndDateBeforeAndStatusNot(LocalDate date, ExamStatus status);
}
