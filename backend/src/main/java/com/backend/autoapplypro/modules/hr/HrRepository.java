package com.backend.autoapplypro.modules.hr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HrRepository extends JpaRepository<HrDetails, Long> {
    List<HrDetails> findByCompanyNameContainingIgnoreCase(String companyName);
    Optional<HrDetails> findByEmailIgnoreCase(String email);

    @org.springframework.transaction.annotation.Transactional
    void deleteByEmailIgnoreCase(String email);
}

