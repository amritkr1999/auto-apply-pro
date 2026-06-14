package com.backend.autoapplypro.HrList;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HrRepository extends JpaRepository<HrDetails, Long> {
    List<HrDetails> findByCompanyNameContainingIgnoreCase(String companyName);
}
