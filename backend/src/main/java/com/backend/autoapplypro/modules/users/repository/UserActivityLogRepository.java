package com.backend.autoapplypro.modules.users.repository;

import com.backend.autoapplypro.modules.users.model.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
    List<UserActivityLog> findByUserIdAndActivityDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<UserActivityLog> findByUserIdAndActivityType(Long userId, String activityType);
    boolean existsByUserIdAndActivityTypeAndReferenceId(Long userId, String activityType, Long referenceId);
    List<UserActivityLog> findByUserId(Long userId);
}
