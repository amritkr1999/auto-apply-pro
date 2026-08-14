package com.backend.autoapplypro.modules.users.repository;

import com.backend.autoapplypro.modules.users.model.User;
import com.backend.autoapplypro.modules.users.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.backend.autoapplypro.modules.users.public_profile.dto.PublicProfileProjection;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

    @Query("SELECT u.isProfilePublic FROM User u WHERE u.username = :username")
    Optional<Boolean> findIsProfilePublicByUsername(@Param("username") String username);

    @Query("SELECT u.username as username, u.name as name, c.summary as summary, u.avatar as avatar, " +
           "c.githubUsername as githubUsername, c.githubProfileUrl as githubProfileUrl, " +
           "c.linkedinProfileUrl as linkedinProfileUrl, c.linkedinName as linkedinName, " +
           "c.githubStats as githubStats, c.leetcodeStats as leetcodeStats, c.leetcodeUsername as leetcodeUsername, " +
           "c.isVerified as isVerified " +
           "FROM User u JOIN u.professionalProfiles c " +
           "WHERE u.username = :username AND u.isProfilePublic = true AND c.isDefault = true")
    Optional<PublicProfileProjection> findPublicProfileByUsername(@Param("username") String username);

    @Query("SELECT s.name FROM ProfessionalProfile c JOIN c.skills s WHERE c.user.username = :username AND c.isDefault = true")
    List<String> findSkillsByUsername(@Param("username") String username);
    Optional<User> findByResetToken(String resetToken);
    Optional<User> findByUnsubscribeToken(String unsubscribeToken);
    List<User> findByStatusAndDeletionScheduledAtBefore(UserStatus status, LocalDateTime dateTime);
    List<User> findByDailyDigestEnabledTrueAndStatus(UserStatus status);
}
