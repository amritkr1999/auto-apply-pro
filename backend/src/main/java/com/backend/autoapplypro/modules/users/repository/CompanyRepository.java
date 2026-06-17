package com.backend.autoapplypro.modules.users.repository;

import com.backend.autoapplypro.modules.users.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByName(String name);
    Optional<Company> findByUserId(Long userId);
}
