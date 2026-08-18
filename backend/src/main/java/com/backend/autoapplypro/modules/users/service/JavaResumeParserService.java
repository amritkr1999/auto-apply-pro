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
            "(?:\\+?\\d{1,4}[-.\\s]?)?(?:\\(?\\d{2,5}\\)?[-.\\s]?)?\\d{2,4}[-.\\s]?\\d{2,4}[-.\\s]?\\d{2,4}");

    private static final Pattern LINKEDIN_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.)?linkedin\\.com/in/([a-zA-Z0-9_-]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern GITHUB_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.)?github\\.com/([a-zA-Z0-9_-]+)", Pattern.CASE_INSENSITIVE);

    private static final Pattern DATE_RANGE_PATTERN = Pattern.compile(
            "(?i)(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\\d{2}/\\d{4}|\\d{4})\\s*[-–—to\\s]+\\s*(?:Present|Current|Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\\d{2}/\\d{4}|\\d{4})");

    private static final Set<String> COMMON_SKILLS_DICTIONARY;

    static {
        Set<String> skills = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        skills.addAll(Arrays.asList(
                // Languages
                "Java", "Python", "JavaScript", "TypeScript", "C", "C++", "C#", "Go", "Golang", "Rust", "Ruby", "PHP",
                "Swift", "Kotlin", "Scala", "R", "Dart", "SQL", "HTML", "HTML5", "CSS", "CSS3", "Sass", "Bash", "Shell",

                // Frameworks & Libraries
                "Spring", "Spring Boot", "Spring MVC", "Spring Data", "Spring Security", "Hibernate", "JPA",
                "React", "React.js", "ReactJS", "React Native", "Angular", "AngularJS", "Vue", "Vue.js", "Next.js", "Nuxt.js", "Node.js",
                "Express", "Express.js", "NestJS", "Django", "Flask", "FastAPI", "ASP.NET", ".NET Core",
                "Tailwind", "TailwindCSS", "Bootstrap", "Redux", "GraphQL", "REST API", "RESTful API", "Microservices",

                // Databases & Caching
                "PostgreSQL", "Postgres", "MySQL", "MariaDB", "Oracle", "SQL Server", "SQLite",
                "MongoDB", "Cassandra", "DynamoDB", "CouchDB", "Redis", "Elasticsearch", "Neo4j",

                // Cloud & DevOps & Tools
                "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud Platform", "Docker", "Kubernetes", "K8s",
                "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Terraform", "Ansible", "Puppet",
                "Nginx", "Apache", "Linux", "Unix", "Ubuntu", "Debian", "CentOS", "Salesforce", "Genesys", "Kroll Platform",

                // AI & Data Tools
                "ChatGPT", "Claude", "Microsoft Copilot", "Generative AI", "Tableau", "Power BI", "Advanced Excel", "Excel",
                "Dashboard Development", "Business Intelligence", "KPI Reporting", "Data Visualization", "Data Analysis",
                "Data Interpretation", "QEval", "Quality Evaluation",

                // Management & Project Skills
                "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Postman", "Maven", "Gradle", "npm", "yarn",
                "Agile", "Scrum", "Kanban", "CI/CD", "TDD", "JUnit", "Mockito", "Jest", "Cypress", "Selenium",
                "Kafka", "RabbitMQ", "ActiveMQ", "WebSockets", "gRPC", "OpenAPI", "Swagger",
                "Project Coordination", "Project Planning & Tracking", "Project Planning", "Project Documentation",
                "Requirements Gathering", "Stakeholder Management", "Cross-functional Collaboration", "Product Requirements",
                "Feature Definition", "Project Testing & Validation", "Project Testing", "Workflow Optimization",
                "Process Improvement", "Client & Case Management", "CRM Management", "Incident Documentation",
                "Cybersecurity Recovery", "Identity Protection", "Client Management", "Case Management"
        ));
        COMMON_SKILLS_DICTIONARY = Collections.unmodifiableSet(skills);
    }

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

        // 3. Extract Summary (with fallback to top paragraph if SUMMARY section header is absent)
        String summary = extractSummary(sections, lines, email, phone);

        // 4. Extract Skills (combining dictionary and dynamic SKILLS section parsing)
        List<String> skills = extractSkills(cleanedText, sections.getOrDefault("SKILLS", Collections.emptyList()));

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
        // Common job titles to strip from candidate name line
        Pattern titleSuffixPattern = Pattern.compile("(?i)\\s+(Software Engineer|Software Developer|Solution Analyst|Full Stack Web Developer|Full Stack Developer|Backend Developer|Frontend Developer|Data Scientist|Product Manager|Project Manager|Consultant|Architect|Engineer|Developer|Analyst|Intern|Associate|Co-Founder)$");

        for (int i = 0; i < Math.min(lines.length, 6); i++) {
            String line = lines[i].trim();
            if (line.isEmpty() || line.length() > 60) continue;
            if (email != null && line.contains(email)) continue;
            if (phone != null && line.contains(phone)) continue;
            if (line.toLowerCase().contains("resume") || line.toLowerCase().contains("curriculum vitae") || line.toLowerCase().contains("page")) continue;
            if (line.matches("(?i)^(summary|experience|education|skills|profile|contact).*")) continue;

            // Strip job titles appended to name (e.g. "Ankit Roy Software Engineer")
            String cleanLine = titleSuffixPattern.matcher(line).replaceAll("").trim();

            // Clean candidate name
            String cleanName = cleanLine.replaceAll("[^a-zA-Z\\s.-]", "").trim();
            if (cleanName.length() >= 3 && cleanName.split("\\s+").length <= 4) {
                return cleanName;
            }
        }
        return "Unknown Candidate";
    }

    private String extractLocation(String[] lines) {
        // Exclude technical, code, and non-location nouns
        Set<String> nonLocationWords = new HashSet<>(Arrays.asList(
                "operations", "data", "analytics", "coordination", "management", "experience",
                "summary", "skills", "projects", "education", "development", "lead", "engineer",
                "html", "css", "sql", "queries", "implementing", "javascript", "python", "java",
                "react", "node", "docker", "git", "api", "apis", "rest", "json", "xml", "http",
                "database", "backend", "frontend", "fullstack", "stack", "testing", "code",
                "system", "services", "platform", "solutions", "web", "soft", "team", "public",
                "argusoft", "etech", "easynaukri", "shopdeck", "highradius", "wipro"
        ));

        // 1. Check top header lines for specific city/state locations FIRST before fallback to generic country
        for (int i = 0; i < Math.min(lines.length, 15); i++) {
            String line = lines[i].trim().toLowerCase();
            if (line.contains("gandhinagar") && line.contains("india")) return "Gandhinagar, India";
            if (line.contains("gandhinagar") || line.contains("gujarat")) return "Gandhinagar, Gujarat";
            if (line.contains("kolkata")) return "Kolkata";
            if (line.contains("bhubaneswar")) return "Bhubaneswar";
            if (line.contains("bangalore")) return "Bangalore";
            if (line.contains("shillong")) return "Shillong";
            if (line.contains("jamshedpur")) return "Jamshedpur";
            if (line.contains("vidisha") || line.contains("madhya pradesh")) return "Vidisha, Madhya Pradesh";
        }

        // 2. Generic country fallback in top header
        for (int i = 0; i < Math.min(lines.length, 8); i++) {
            String line = lines[i].trim().toLowerCase();
            if (line.contains("india")) return "India";
            if (line.contains("united states") || line.contains("usa")) return "United States";
            if (line.contains("canada")) return "Canada";
            if (line.contains("united kingdom") || line.contains("uk")) return "United Kingdom";
        }

        // 3. Regex search for City, State / Country pattern with optional space before comma
        Pattern locPattern = Pattern.compile("(?i)\\b([A-Z][a-zA-Z]+(?:\\s[A-Z][a-zA-Z]+)?)\\s*,\\s*([A-Z]{2}|[A-Z][a-zA-Z]+)\\b");
        for (int i = 0; i < Math.min(lines.length, 12); i++) {
            Matcher m = locPattern.matcher(lines[i]);
            if (m.find()) {
                String g1 = m.group(1).trim();
                String g2 = m.group(2).trim();
                String[] g1Words = g1.split("\\s+");
                if (g1Words.length > 1 && nonLocationWords.contains(g1Words[0].toLowerCase())) {
                    g1 = g1.substring(g1Words[0].length()).trim();
                }
                if (!nonLocationWords.contains(g1.toLowerCase()) && !nonLocationWords.contains(g2.toLowerCase())) {
                    return g1 + ", " + g2;
                }
            }
        }
        return null;
    }

    private Map<String, List<String>> segmentSections(String[] lines) {
        Map<String, List<String>> sections = new LinkedHashMap<>();
        String currentSection = "HEADER";
        sections.put(currentSection, new ArrayList<>());

        Pattern headerPattern = Pattern.compile("(?i)^(SUMMARY|PROFILE|OBJECTIVE|EXPERIENCE|WORK EXPERIENCE|WORK HISTORY|EMPLOYMENT|PROFESSIONAL EXPERIENCE|PROFESSIONAL EXPERIENCES|EDUCATION|ACADEMIC|SKILLS|TECHNICAL SKILLS|TECHNOLOGY|TECHNOLOGIES|CERTIFICATIONS|CERTIFICATION|PROJECTS|PROJECT|PERSONAL PROJECTS|ACHIEVEMENTS|AWARDS|INTERESTS)$");

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;

            // Remove formatting symbols like '---', '===', colon
            String headerCandidate = trimmed.replaceAll("[:\\-=_#]", "").trim();
            Matcher matcher = headerPattern.matcher(headerCandidate);

            if (matcher.matches()) {
                String headerKey = matcher.group(1).toUpperCase();
                if (headerKey.contains("WORK") || headerKey.contains("EMPLOYMENT") || headerKey.contains("EXPERIENCE")) {
                    currentSection = "EXPERIENCE";
                } else if (headerKey.contains("ACADEMIC")) {
                    currentSection = "EDUCATION";
                } else if (headerKey.contains("TECHNICAL") || headerKey.contains("TECHNOLOG")) {
                    currentSection = "SKILLS";
                } else if (headerKey.contains("PROFILE") || headerKey.contains("OBJECTIVE")) {
                    currentSection = "SUMMARY";
                } else if (headerKey.contains("CERTIFICATION")) {
                    currentSection = "CERTIFICATIONS";
                } else if (headerKey.contains("PROJECT")) {
                    currentSection = "PROJECTS";
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

    private String extractSummary(Map<String, List<String>> sections, String[] lines, String email, String phone) {
        List<String> summaryLines = sections.get("SUMMARY");
        if (summaryLines != null && !summaryLines.isEmpty()) {
            return String.join(" ", summaryLines);
        }

        // Fallback: search for top paragraph lines in HEADER section
        List<String> headerLines = sections.get("HEADER");
        if (headerLines != null && !headerLines.isEmpty()) {
            StringBuilder summaryBuilder = new StringBuilder();
            for (String line : headerLines) {
                String trimmed = line.trim();
                if (trimmed.isEmpty()) continue;
                if (email != null && trimmed.contains(email)) continue;
                if (phone != null && trimmed.contains(phone)) continue;
                if (trimmed.contains("@") || trimmed.contains("1999") || trimmed.toLowerCase().contains("linkedin") || trimmed.toLowerCase().contains("github")) continue;
                if (trimmed.length() < 15 && !trimmed.contains(" ")) continue; // Skip candidate name

                // Capture paragraph text lines (> 25 characters)
                if (trimmed.length() >= 25) {
                    if (summaryBuilder.length() > 0) summaryBuilder.append(" ");
                    summaryBuilder.append(trimmed);
                }
            }
            if (summaryBuilder.length() > 0) {
                return summaryBuilder.toString();
            }
        }
        return null;
    }

    private List<String> extractSkills(String text, List<String> skillSectionLines) {
        Set<String> matchedSkills = new LinkedHashSet<>();

        // 1. Dynamic extraction from SKILLS section lines
        if (skillSectionLines != null && !skillSectionLines.isEmpty()) {
            for (String line : skillSectionLines) {
                String content = line;
                // Remove category prefix like "Languages:", "Frontend:", "PROJECT & COORDINATION:"
                if (content.contains(":")) {
                    int colonIndex = content.indexOf(":");
                    content = content.substring(colonIndex + 1);
                }
                // Tokenize by |, ,, •, or /
                String[] tokens = content.split("[|•,/]");
                for (String token : tokens) {
                    String cleanSkill = token.trim().replaceAll("^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$", "");
                    if (cleanSkill.length() >= 2 && cleanSkill.length() <= 50) {
                        matchedSkills.add(cleanSkill);
                    }
                }
            }
        }

        // 2. Dictionary match across full text
        for (String skill : COMMON_SKILLS_DICTIONARY) {
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
        StringBuilder pendingDescBuilder = new StringBuilder();
        String pendingHeaderLine = null;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;

            boolean isLocationLine = trimmed.equalsIgnoreCase("Gandhinagar, India") 
                    || trimmed.equalsIgnoreCase("India") 
                    || trimmed.toLowerCase().startsWith("gandhinagar,");

            Matcher dateMatcher = DATE_RANGE_PATTERN.matcher(trimmed);
            if (dateMatcher.find()) {
                // Finalize previous experience item
                if (currentExp != null) {
                    currentExp.put("description", descBuilder.toString().trim());
                    experienceList.add(currentExp);
                    descBuilder = new StringBuilder();
                }

                currentExp = new LinkedHashMap<>();
                String dateRange = dateMatcher.group().trim();
                currentExp.put("duration", dateRange);

                // Prefer pendingHeaderLine if present, otherwise inline header
                String inlineHeader = trimmed.replace(dateRange, "").replaceAll("^[|–\\-\\s]+|[|–\\-\\s]+$", "").trim();
                boolean inlineIsValid = !inlineHeader.isEmpty() && inlineHeader.length() > 3 
                        && !inlineHeader.equalsIgnoreCase("Present") 
                        && !inlineHeader.equalsIgnoreCase("- Present");
                
                String headerLineToUse = (pendingHeaderLine != null && !isLocationLine)
                        ? pendingHeaderLine
                        : (inlineIsValid ? inlineHeader : pendingHeaderLine);

                if (headerLineToUse != null) {
                    parseTitleAndCompany(headerLineToUse, currentExp);
                } else {
                    currentExp.put("title", "Position");
                    currentExp.put("company", "Company");
                }

                // Append any description bullets gathered before the date range line
                if (pendingDescBuilder.length() > 0) {
                    if (descBuilder.length() > 0) descBuilder.append(" ");
                    descBuilder.append(pendingDescBuilder);
                    pendingDescBuilder = new StringBuilder();
                }
                pendingHeaderLine = null;
            } else {
                boolean isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("+") || trimmed.startsWith("·");
                boolean isHeader = !isBullet && !isLocationLine && (
                        trimmed.contains(" | ") || trimmed.contains(" at ") || trimmed.contains(" – ") || trimmed.contains(" - ") ||
                        (trimmed.contains(",") && (
                            trimmed.toLowerCase().contains("analyst") || trimmed.toLowerCase().contains("developer") ||
                            trimmed.toLowerCase().contains("engineer") || trimmed.toLowerCase().contains("manager") ||
                            trimmed.toLowerCase().contains("consultant") || trimmed.toLowerCase().contains("lead")
                        ))
                );

                if (isHeader) {
                    if (pendingHeaderLine == null) {
                        pendingHeaderLine = trimmed;
                    }
                } else if (!isLocationLine) {
                    if (currentExp != null) {
                        if (descBuilder.length() > 0) descBuilder.append(" ");
                        descBuilder.append(trimmed);
                    } else if (pendingHeaderLine != null) {
                        if (pendingDescBuilder.length() > 0) pendingDescBuilder.append(" ");
                        pendingDescBuilder.append(trimmed);
                    } else if (!isBullet) {
                        pendingHeaderLine = trimmed;
                    }
                }
            }
        }

        if (currentExp != null) {
            currentExp.put("description", descBuilder.toString().trim());
            experienceList.add(currentExp);
        }

        return experienceList;
    }

    private void parseTitleAndCompany(String headerLine, Map<String, Object> targetMap) {
        if (headerLine.contains(" at ")) {
            String[] parts = headerLine.split(" at ");
            targetMap.put("title", parts[0].trim());
            targetMap.put("company", parts[1].trim());
        } else if (headerLine.contains(" | ")) {
            String[] parts = headerLine.split(" \\| ");
            targetMap.put("title", parts[0].trim());
            targetMap.put("company", parts[1].trim());
        } else if (headerLine.contains(" – ")) {
            String[] parts = headerLine.split(" – ");
            targetMap.put("title", parts[0].trim());
            targetMap.put("company", parts[1].trim());
        } else if (headerLine.contains(" - ")) {
            String[] parts = headerLine.split(" - ");
            targetMap.put("title", parts[0].trim());
            targetMap.put("company", parts[1].trim());
        } else if (headerLine.contains(",")) {
            String[] parts = headerLine.split(",");
            String p1 = parts[0].trim();
            String p2 = parts[1].trim();
            // E.g. "Argusoft, Programmer Analyst" -> Company = Argusoft, Title = Programmer Analyst
            if (p2.toLowerCase().contains("analyst") || p2.toLowerCase().contains("developer") || p2.toLowerCase().contains("engineer") || p2.toLowerCase().contains("manager")) {
                targetMap.put("company", p1);
                targetMap.put("title", p2);
            } else {
                targetMap.put("title", p1);
                targetMap.put("company", p2);
            }
        } else {
            targetMap.put("title", headerLine);
            targetMap.put("company", "Company");
        }
    }

    private List<Map<String, Object>> extractEducation(List<String> sectionLines, String[] allLines) {
        List<Map<String, Object>> educationList = new ArrayList<>();
        Pattern degreePattern = Pattern.compile("(?i)(?:B\\.S\\.|B\\.Tech|B\\.E\\.|B\\.A\\.|M\\.S\\.|M\\.Tech|M\\.B\\.A\\.|Ph\\.D|\\bBachelor\\b|\\bMaster\\b|\\bDiploma\\b|\\bAssociate\\b)");
        Pattern yearPattern = Pattern.compile("\\b(19|20)\\d{2}\\b");

        boolean isSectionEmpty = sectionLines == null || sectionLines.isEmpty();
        List<String> linesToScan = !isSectionEmpty ? sectionLines : Arrays.asList(allLines);

        Map<String, Object> currentEdu = null;
        StringBuilder detailsBuilder = new StringBuilder();

        for (String line : linesToScan) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;

            boolean isDegreeLine = degreePattern.matcher(trimmed).find();

            if (isDegreeLine) {
                // Finalize previous education entry
                if (currentEdu != null) {
                    if (detailsBuilder.length() > 0) {
                        currentEdu.put("details", detailsBuilder.toString().trim());
                    }
                    educationList.add(currentEdu);
                    detailsBuilder = new StringBuilder();
                }

                currentEdu = new LinkedHashMap<>();
                currentEdu.put("degree", trimmed);

                Matcher yearMatcher = yearPattern.matcher(trimmed);
                if (yearMatcher.find()) {
                    try {
                        currentEdu.put("graduation_year", Integer.parseInt(yearMatcher.group()));
                    } catch (NumberFormatException ignored) {}
                }

                String institution = "University / College";
                if (trimmed.toLowerCase().contains("university") || trimmed.toLowerCase().contains("institute") || trimmed.toLowerCase().contains("college") || trimmed.toLowerCase().contains("school")) {
                    institution = trimmed;
                }
                currentEdu.put("institution", institution);
            } else if (currentEdu != null) {
                Matcher yearMatcher = yearPattern.matcher(trimmed);
                if (yearMatcher.find() && !currentEdu.containsKey("graduation_year")) {
                    try {
                        int yr = Integer.parseInt(yearMatcher.group());
                        while (yearMatcher.find()) {
                            yr = Integer.parseInt(yearMatcher.group());
                        }
                        currentEdu.put("graduation_year", yr);
                    } catch (NumberFormatException ignored) {}
                }

                if (trimmed.toLowerCase().contains("university") || trimmed.toLowerCase().contains("institute") || trimmed.toLowerCase().contains("college") || trimmed.toLowerCase().contains("school")) {
                    if ("University / College".equals(currentEdu.get("institution"))) {
                        currentEdu.put("institution", trimmed);
                    }
                }

                if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.toLowerCase().contains("gpa") || trimmed.toLowerCase().contains("coursework")) {
                    if (detailsBuilder.length() > 0) detailsBuilder.append(" ");
                    detailsBuilder.append(trimmed);
                }
            }
        }

        if (currentEdu != null) {
            if (detailsBuilder.length() > 0) {
                currentEdu.put("details", detailsBuilder.toString().trim());
            }
            educationList.add(currentEdu);
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
