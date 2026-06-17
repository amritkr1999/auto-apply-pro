package com.backend.autoapplypro.modules.outreach.repository;

import com.backend.autoapplypro.modules.outreach.model.GmailCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GmailCredentialRepository extends JpaRepository<GmailCredential, Long> {
    Optional<GmailCredential> findByUserId(Long userId);
}
