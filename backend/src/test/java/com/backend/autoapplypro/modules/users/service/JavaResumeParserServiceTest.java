package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.dto.ParsedResumeDto;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class JavaResumeParserServiceTest {

    private final JavaResumeParserService parserService = new JavaResumeParserService();

    @Test
    public void testParseResumeFromPlainText() {
        String resumeText = """
                Alex Johnson
                alex.johnson@example.com | (555) 019-2834 | San Francisco, CA
                github.com/alexj | linkedin.com/in/alexjohnson

                SUMMARY
                Experienced Senior Software Engineer with expertise in Java, Spring Boot, React, Docker, and PostgreSQL.

                SKILLS
                Java, Spring Boot, React, TypeScript, Docker, Kubernetes, AWS, PostgreSQL, Redis, REST API

                EXPERIENCE
                Senior Software Engineer at TechCorp
                Jan 2021 - Present
                Built microservices and scalable cloud solutions using Spring Boot, AWS, and PostgreSQL.

                Software Developer at CodeSoft
                Jun 2018 - Dec 2020
                Developed frontend UI using React and TypeScript.

                EDUCATION
                B.S. Computer Science, University of California, 2018
                """;

        ParsedResumeDto dto = parserService.parseResume(resumeText.getBytes(), "text/plain", "resume.txt");

        assertNotNull(dto);
        assertEquals("Alex Johnson", dto.getName());
        assertEquals("alex.johnson@example.com", dto.getEmail());
        assertEquals("(555) 019-2834", dto.getPhone());
        assertEquals("San Francisco, CA", dto.getLocation());

        assertNotNull(dto.getSummary());
        assertTrue(dto.getSummary().contains("Senior Software Engineer"));

        assertNotNull(dto.getSkills());
        assertTrue(dto.getSkills().contains("Java"));
        assertTrue(dto.getSkills().contains("Spring Boot"));
        assertTrue(dto.getSkills().contains("React"));
        assertTrue(dto.getSkills().contains("Docker"));
        assertTrue(dto.getSkills().contains("PostgreSQL"));

        assertNotNull(dto.getExperience());
        assertTrue(dto.getExperience().size() >= 1);

        assertNotNull(dto.getEducation());
        assertTrue(dto.getEducation().size() >= 1);
    }
}
