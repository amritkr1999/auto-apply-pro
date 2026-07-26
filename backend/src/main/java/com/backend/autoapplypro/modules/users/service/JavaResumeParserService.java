package com.backend.autoapplypro.modules.users.service;

import com.backend.autoapplypro.modules.users.dto.ParsedResumeDto;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class JavaResumeParserService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", Pattern.CASE_INSENSITIVE);

    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "(?:\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}");

    private static final Pattern LINKEDIN_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.)?linkedin\\.com/in/([a-zA-Z0-9_-]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern GITHUB_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.)?github\\.com/([a-zA-Z0-9_-]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern DATE_RANGE_PATTERN = Pattern.compile(
            "(?i)(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\\d{2}/\\d{4}|\\d{4})\\s*[-–—\\s+to]+\\s*(?:Present|Current|Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\\d{2}/\\d{4}|\\d{4})");

    private static final Set<String> COMMON_SKILLS_DICTIONARY = Collections.unmodifiableSet(new TreeSet<>(String.CASE_INSENSITIVE_ORDER) {{
        addAll(Arrays.asList(
                // Languages
                "Java", "Python", "JavaScript", "TypeScript", "C", "C++", "C#", "Go", "Golang", "Rust", "Ruby", "PHP",
                "Swift", "Kotlin", "Scala", "R", "Dart", "SQL", "HTML", "HTML5", "CSS", "CSS3", "Sass", "Bash", "Shell",

                // Frameworks & Libraries
                "Spring", "Spring Boot", "Spring MVC", "Spring Data", "Spring Security", "Hibernate", "JPA",
                "React", "React.js", "React Native", "Angular", "Vue", "Vue.js", "Next.js", "Nuxt.js", "Node.js",
                "Express", "Express.js", "NestJS", "Django", "Flask", "FastAPI", "ASP.NET", ".NET Core",
                "Tailwind", "TailwindCSS", "Bootstrap", "Redux", "GraphQL", "REST API", "RESTful API", "Microservices",

                // Databases & Caching
                "PostgreSQL", "Postgres", "MySQL", "MariaDB", "Oracle", "SQL Server", "SQLite",
                "MongoDB", "Cassandra", "DynamoDB", "CouchDB", "Redis", "Elasticsearch", "Neo4j",

                // Cloud & DevOps
                "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud Platform", "Docker", "Kubernetes", "K8s",
                "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Terraform", "Ansible", "Puppet",
                "Nginx", "Apache", "Linux", "Unix", "Ubuntu", "Debian", "CentOS",

                // Tools & Methodologies
                "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Postman", "Maven", "Gradle", "npm", "yarn",
                "Agile", "Scrum", "Kanban", "CI/CD", "TDD", "JUnit", "Mockito", "Jest", "Cypress", "Selenium",
                "Kafka", "RabbitMQ", "ActiveMQ", "WebSockets", "gRPC", "OpenAPI", "Swagger"
        ));
    }});

    /**
     * Parse raw resume bytes into a structured ParsedResumeDto using non-AI rules.
     */
    public ParsedResumeDto parseResume(byte[] bytes, String contentType, String filename) {
        log.info("Starting Java rule-based parsing for file: {} (Type: {})", filename, contentType);
        String text = extractText(bytes, contentType, filename);

        if (text == null || text.trim().isEmpty()) {
            log.warn("Extracted text is empty for resume: {}", filename);
            return ParsedResumeDto.builder().build();
        }

        String cleanedText = text.replace("\r", "");
        String[] lines = cleanedText.split("\n");

        // 1. Contact Information
        String email = extractFirstMatch(cleanedText, EMAIL_PATTERN);
        String phone = extractFirstMatch(cleanedText, PHONE_PATTERN);
        String linkedin = extractFirstMatch(cleanedText, LINKEDIN_PATTERN);
        String github = extractFirstMatch(cleanedText, GITHUB_PATTERN);
        String name = extractName(lines, email, phone);

        // 2. Section Segmentation
        Map<String, List<String>> sections = segmentSections(lines);

        // 3. Extract Summary
        String summary = extractSummary(sections);

        // 4. Extract Skills
        List<String> skills = extractSkills(cleanedText);

        // 5. Extract Work Experience (with fallback to all lines)
        List<String> expLines = sections.getOrDefault("EXPERIENCE", Collections.emptyList());
        if (expLines.isEmpty()) {
            expLines = Arrays.asList(lines);
        }
        List<Map<String, Object>> experience = extractExperience(expLines);

        // 6. Extract Education (with fallback to degree pattern search if section empty)
        List<String> eduLines = sections.getOrDefault("EDUCATION", Collections.emptyList());
        List<Map<String, Object>> education = extractEducation(eduLines, lines);

        // 7. Extract Certifications
        List<String> certifications = extractCertifications(sections.getOrDefault("CERTIFICATIONS", Collections.emptyList()));

        log.info("Successfully parsed resume for '{}': found {} skills, {} experience entries, {} education entries",
                name, skills.size(), experience.size(), education.size());

        return ParsedResumeDto.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .location(extractLocation(lines))
                .summary(summary)
                .skills(skills)
                .experience(experience)
                .education(education)
                .certifications(certifications)
                .build();
    }

    /**
     * Extract plain text from PDF, DOCX, or plain text bytes.
     */
    public String extractText(byte[] bytes, String contentType, String filename) {
        if (bytes == null || bytes.length == 0) return "";

        String fn = filename != null ? filename.toLowerCase() : "";
        String ct = contentType != null ? contentType.toLowerCase() : "";

        try {
            if (fn.endsWith(".pdf") || ct.contains("pdf")) {
                try (PDDocument doc = Loader.loadPDF(bytes)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(doc);
                }
            } else if (fn.endsWith(".docx") || ct.contains("wordprocessingml")) {
                try (InputStream is = new ByteArrayInputStream(bytes);
                     XWPFDocument doc = new XWPFDocument(is);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    return extractor.getText();
                }
            } else {
                return new String(bytes, StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.error("Failed to extract text from file '{}': {}", filename, e.getMessage(), e);
            // Fallback to UTF-8 text string decoding
            return new String(bytes, StandardCharsets.UTF_8);
        }
    }

    private String extractFirstMatch(String text, Pattern pattern) {
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group().trim();
        }
        return null;
    }

    private String extractName(String[] lines, String email, String phone) {
        for (int i = 0; i < Math.min(lines.length, 6); i++) {
            String line = lines[i].trim();
            if (line.isEmpty() || line.length() > 50) continue;
            if (email != null && line.contains(email)) continue;
            if (phone != null && line.contains(phone)) continue;
            if (line.toLowerCase().contains("resume") || line.toLowerCase().contains("curriculum vitae") || line.toLowerCase().contains("page")) continue;
            if (line.matches("(?i)^(summary|experience|education|skills|profile|contact).*")) continue;

            // Clean candidate name
            String cleanName = line.replaceAll("[^a-zA-Z\\s.-]", "").trim();
            if (cleanName.length() >= 3 && cleanName.split("\\s+").length <= 4) {
                return cleanName;
            }
        }
        return "Unknown Candidate";
    }

    private String extractLocation(String[] lines) {
        Pattern locPattern = Pattern.compile("(?i)\\b([A-Z][a-z]+(?:\\s[A-Z][a-z]+)?),\\s*([A-Z]{2}|[A-Z][a-z]+)\\b");
        for (int i = 0; i < Math.min(lines.length, 10); i++) {
            Matcher m = locPattern.matcher(lines[i]);
            if (m.find()) {
                return m.group().trim();
            }
        }
        return null;
    }

    private Map<String, List<String>> segmentSections(String[] lines) {
        Map<String, List<String>> sections = new LinkedHashMap<>();
        String currentSection = "HEADER";
        sections.put(currentSection, new ArrayList<>());

        Pattern headerPattern = Pattern.compile("(?i)^(SUMMARY|PROFILE|OBJECTIVE|EXPERIENCE|WORK EXPERIENCE|WORK HISTORY|EMPLOYMENT|EDUCATION|ACADEMIC|SKILLS|TECHNICAL SKILLS|CERTIFICATIONS|PROJECTS)$");

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;

            // Remove formatting symbols like '---', '===', colon
            String headerCandidate = trimmed.replaceAll("[:\\-=_#]", "").trim();
            Matcher matcher = headerPattern.matcher(headerCandidate);

            if (matcher.matches()) {
                String headerKey = matcher.group(1).toUpperCase();
                if (headerKey.contains("WORK") || headerKey.contains("EMPLOYMENT")) {
                    currentSection = "EXPERIENCE";
                } else if (headerKey.contains("ACADEMIC")) {
                    currentSection = "EDUCATION";
                } else if (headerKey.contains("TECHNICAL")) {
                    currentSection = "SKILLS";
                } else if (headerKey.contains("PROFILE") || headerKey.contains("OBJECTIVE")) {
                    currentSection = "SUMMARY";
                } else {
                    currentSection = headerKey;
                }
                sections.putIfAbsent(currentSection, new ArrayList<>());
            } else {
                sections.computeIfAbsent(currentSection, k -> new ArrayList<>()).add(trimmed);
            }
        }
        return sections;
    }

    private String extractSummary(Map<String, List<String>> sections) {
        List<String> summaryLines = sections.get("SUMMARY");
        if (summaryLines != null && !summaryLines.isEmpty()) {
            return String.join(" ", summaryLines);
        }
        return null;
    }

    private List<String> extractSkills(String text) {
        Set<String> matchedSkills = new LinkedHashSet<>();

        for (String skill : COMMON_SKILLS_DICTIONARY) {
            // Regex for exact word boundary match
            String patternString = "\\b" + Pattern.quote(skill) + "\\b";
            Pattern p = Pattern.compile(patternString, Pattern.CASE_INSENSITIVE);
            if (p.matcher(text).find()) {
                matchedSkills.add(skill);
            }
        }
        return new ArrayList<>(matchedSkills);
    }

    private List<Map<String, Object>> extractExperience(List<String> lines) {
        List<Map<String, Object>> experienceList = new ArrayList<>();
        Map<String, Object> currentExp = null;
        StringBuilder descBuilder = new StringBuilder();

        for (String line : lines) {
            Matcher dateMatcher = DATE_RANGE_PATTERN.matcher(line);
            if (dateMatcher.find()) {
                if (currentExp != null) {
                    currentExp.put("description", descBuilder.toString().trim());
                    experienceList.add(currentExp);
                    descBuilder = new StringBuilder();
                }

                currentExp = new LinkedHashMap<>();
                String dateRange = dateMatcher.group().trim();
                currentExp.put("duration", dateRange);

                // Extract title / company from before the date or rest of the line
                String headerPart = line.replace(dateRange, "").trim();
                if (headerPart.contains(" at ")) {
                    String[] parts = headerPart.split(" at ");
                    currentExp.put("title", parts[0].trim());
                    currentExp.put("company", parts[1].trim());
                } else if (headerPart.contains(" - ")) {
                    String[] parts = headerPart.split(" - ");
                    currentExp.put("title", parts[0].trim());
                    currentExp.put("company", parts[1].trim());
                } else {
                    currentExp.put("title", headerPart.isEmpty() ? "Position" : headerPart);
                    currentExp.put("company", "Company");
                }
            } else if (currentExp != null) {
                if (descBuilder.length() > 0) descBuilder.append(" ");
                descBuilder.append(line);
            }
        }

        if (currentExp != null) {
            currentExp.put("description", descBuilder.toString().trim());
            experienceList.add(currentExp);
        }

        return experienceList;
    }

    private List<Map<String, Object>> extractEducation(List<String> sectionLines, String[] allLines) {
        List<Map<String, Object>> educationList = new ArrayList<>();
        Pattern degreePattern = Pattern.compile("(?i)(?:B\\.S\\.|B\\.Tech|B\\.E\\.|B\\.A\\.|M\\.S\\.|M\\.Tech|M\\.B\\.A\\.|Ph\\.D|\\bBachelor\\b|\\bMaster\\b|\\bDiploma\\b|\\bAssociate\\b)");
        Pattern yearPattern = Pattern.compile("\\b(19|20)\\d{2}\\b");

        boolean isSectionEmpty = sectionLines == null || sectionLines.isEmpty();
        List<String> linesToScan = !isSectionEmpty ? sectionLines : Arrays.asList(allLines);

        for (String line : linesToScan) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.length() < 3) continue;

            if (isSectionEmpty) {
                if (!degreePattern.matcher(trimmed).find() && !yearPattern.matcher(trimmed).find()) {
                    continue;
                }
            }

            Map<String, Object> edu = new LinkedHashMap<>();
            edu.put("degree", trimmed);
            
            Matcher yearMatcher = yearPattern.matcher(trimmed);
            if (yearMatcher.find()) {
                try {
                    edu.put("graduation_year", Integer.parseInt(yearMatcher.group()));
                } catch (NumberFormatException ignored) {}
            }
            
            edu.put("institution", "University / College");
            educationList.add(edu);
        }
        return educationList;
    }

    private List<String> extractCertifications(List<String> lines) {
        List<String> certs = new ArrayList<>();
        for (String line : lines) {
            if (line.length() > 5 && line.length() < 100) {
                certs.add(line);
            }
        }
        return certs;
    }
}
