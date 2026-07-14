package com.backend.autoapplypro.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SkillMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void run(String... args) throws Exception {
        try {
            // Ensure any existing users without a status value are set to ACTIVE
            try {
                jdbcTemplate.execute("UPDATE users SET status = 'ACTIVE' WHERE status IS NULL");
                log.info("Successfully checked and initialized user statuses to ACTIVE.");
            } catch (Exception ex) {
                log.warn("Could not check/update user statuses. The column might not exist yet.", ex);
            }

            // Check if professional_profiles table has skills column and does not have legacy_skills column
            Boolean hasSkillsColumn = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professional_profiles' AND column_name='skills')",
                Boolean.class
            );
            Boolean hasLegacyColumn = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professional_profiles' AND column_name='legacy_skills')",
                Boolean.class
            );

            if (Boolean.TRUE.equals(hasSkillsColumn) && !Boolean.TRUE.equals(hasLegacyColumn)) {
                log.info("Found legacy 'skills' JSONB column in professional_profiles table. Starting migration...");

                // Fetch professional profiles with non-null legacy skills
                List<LegacyCandidateSkills> legacyList = jdbcTemplate.query(
                    "SELECT id, skills FROM professional_profiles WHERE skills IS NOT NULL",
                    (rs, rowNum) -> {
                        Long id = rs.getLong("id");
                        String skillsJson = rs.getString("skills");
                        return new LegacyCandidateSkills(id, skillsJson);
                    }
                );

                for (LegacyCandidateSkills legacy : legacyList) {
                    if (legacy.skillsJson != null && !legacy.skillsJson.trim().isEmpty()) {
                        try {
                            List<?> skills = objectMapper.readValue(legacy.skillsJson, List.class);
                            for (Object skillObj : skills) {
                                String skillName = String.valueOf(skillObj).trim();
                                if (!skillName.isEmpty()) {
                                    // Insert skill if not exists
                                    jdbcTemplate.update(
                                        "INSERT INTO skills (name) VALUES (?) ON CONFLICT (name) DO NOTHING",
                                        skillName
                                    );
                                    
                                    // Fetch skill id
                                    Long skillId = jdbcTemplate.queryForObject(
                                        "SELECT id FROM skills WHERE name = ?",
                                        Long.class,
                                        skillName
                                    );

                                    // Insert candidate-skill association if not exists
                                    jdbcTemplate.update(
                                        "INSERT INTO candidate_skills (candidate_id, skill_id) " +
                                        "SELECT ?, ? WHERE NOT EXISTS (" +
                                        "  SELECT 1 FROM candidate_skills WHERE candidate_id = ? AND skill_id = ?" +
                                        ")",
                                        legacy.candidateId, skillId, legacy.candidateId, skillId
                                    );
                                }
                            }
                        } catch (Exception e) {
                            log.error("Failed to migrate skills for candidate id: {}", legacy.candidateId, e);
                        }
                    }
                }

                // Rename the column to legacy_skills to avoid future runs or conflicts
                jdbcTemplate.execute("ALTER TABLE professional_profiles RENAME COLUMN skills TO legacy_skills");
                log.info("Skill migration completed successfully. Legacy column renamed to 'legacy_skills'.");
            } else {
                log.info("No legacy 'skills' JSONB column found in professional_profiles table. No migration needed.");
            }
        } catch (Exception e) {
            log.error("Error running skill migration", e);
        }
    }

    private static class LegacyCandidateSkills {
        Long candidateId;
        String skillsJson;

        LegacyCandidateSkills(Long candidateId, String skillsJson) {
            this.candidateId = candidateId;
            this.skillsJson = skillsJson;
        }
    }
}
