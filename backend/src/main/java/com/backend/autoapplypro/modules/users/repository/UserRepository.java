package com.backend.autoapplypro.modules.users.repository;

import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    Optional<User> findByUnsubscribeToken(String unsubscribeToken);
    List<User> findByStatusAndDeletionScheduledAtBefore(UserStatus status, LocalDateTime dateTime);
}
