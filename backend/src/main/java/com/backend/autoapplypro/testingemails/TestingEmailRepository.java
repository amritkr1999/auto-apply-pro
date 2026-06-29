package com.backend.autoapplypro.testingemails;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestingEmailRepository extends JpaRepository<TestingEmail, Long> {
    List<TestingEmail> findByCompanyNameContainingIgnoreCase(String companyName);

    @org.springframework.transaction.annotation.Transactional
    void deleteByEmailIgnoreCase(String email);
}
