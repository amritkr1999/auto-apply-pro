package com.backend.autoapplypro.modules.outreach.repository;

import com.backend.autoapplypro.modules.outreach.model.EmailQueue;
import com.backend.autoapplypro.modules.outreach.model.OutreachStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailQueueRepository extends JpaRepository<EmailQueue, Long> {
    List<EmailQueue> findByStatus(OutreachStatus status);
    List<EmailQueue> findByUserId(Long userId);

    @Query("SELECT e FROM EmailQueue e WHERE e.status = :status AND (e.scheduledAt IS NULL OR e.scheduledAt <= :now)")
    List<EmailQueue> findDueEmails(@Param("status") OutreachStatus status, @Param("now") LocalDateTime now);

    Optional<EmailQueue> findFirstByUserIdAndScheduledAtIsNotNullOrderByScheduledAtDesc(Long userId);

    boolean existsByUserIdAndStatusAndSentAtAfter(Long userId, OutreachStatus status, LocalDateTime dateTime);

    List<EmailQueue> findByUserIdAndStatus(Long userId, OutreachStatus status);
}
