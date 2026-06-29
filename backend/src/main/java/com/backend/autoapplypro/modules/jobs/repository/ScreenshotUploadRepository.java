package com.backend.autoapplypro.modules.jobs.repository;

import com.backend.autoapplypro.modules.jobs.model.ScreenshotUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScreenshotUploadRepository extends JpaRepository<ScreenshotUpload, Long> {
    List<ScreenshotUpload> findByUserId(Long userId);
    List<ScreenshotUpload> findByUserIdOrderByCreatedAtDesc(Long userId);
}
