package com.backend.autoapplypro.config;

import com.backend.autoapplypro.modules.users.model.Skill;
import com.backend.autoapplypro.modules.users.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class SkillSeederRunner implements CommandLineRunner {

    private final SkillRepository skillRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting database skill seeding...");
        
        List<String> defaultSkills = Arrays.asList(
            // Java Full Stack Developer
            "Java", "Spring Boot", "Spring Cloud", "Hibernate", "JPA", "Maven",
            
            // Python Full Stack Developer
            "Python", "Django", "Flask", "FastAPI",
            
            // AI Engineer
            "TensorFlow", "PyTorch", "Scikit-learn", "Machine Learning", "Deep Learning", 
            "Natural Language Processing (NLP)", "Computer Vision", "Large Language Models (LLMs)", 
            "LangChain", "NumPy", "Pandas",
            
            // Frontend Developer
            "HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Vue.js", "Angular", 
            "Tailwind CSS", "SASS", "Webpack", "Redux", "Next.js",
            
            // Backend Developer
            "Go", "Node.js", "Express.js", "PostgreSQL", "MongoDB", "Redis", 
            "Docker", "Kubernetes", "REST APIs", "GraphQL", "gRPC", "SQL", "Git", "AWS"
        );

        int seededCount = 0;
        for (String skillName : defaultSkills) {
            String trimmedName = skillName.trim();
            if (!trimmedName.isEmpty()) {
                if (skillRepository.findByNameIgnoreCase(trimmedName).isEmpty()) {
                    Skill skill = Skill.builder().name(trimmedName).build();
                    skillRepository.save(skill);
                    seededCount++;
                }
            }
        }
        
        log.info("Database skill seeding completed. Seeded {} new skills.", seededCount);
    }
}
