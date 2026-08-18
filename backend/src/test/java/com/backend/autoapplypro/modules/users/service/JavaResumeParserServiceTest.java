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

    @Test
    public void testParseAamrinKhanResume() {
        String resumeText = """
                Aamrin Khan
                India • aamrinjsr@gmail.com • +91-8002295666 • LinkedIn

                SUMMARY
                IT Project & Coordination professional with experience across cybersecurity client operations, data analytics, stakeholder management, process improvement, and product operations. Experienced in coordinating client and technology-driven workflows, supporting data-breach recovery activities, documenting requirements, and collaborating with cross-functional teams and developers. Hands-on experience using Generative AI tools including ChatGPT, Claude, and Microsoft Copilot for reporting, documentation, data interpretation, workflow optimization, and product ideation.

                SKILLS
                PROJECT & COORDINATION: Project Coordination | Project Planning & Tracking | Project Documentation | Requirements Gathering | Stakeholder Management | Cross-functional Collaboration | Product Requirements | Feature Definition | Project Testing & Validation | Workflow Optimization | Process Improvement
                DATA & ANALYTICS: Data Analysis | Data Interpretation | Tableau | Power BI | SQL | Advanced Excel | Dashboard Development | Business Intelligence | KPI Reporting | Data Visualization
                AI & DIGITAL PRODUCTIVITY: ChatGPT | Claude | Microsoft Copilot | Generative AI | AI-Assisted Reporting | AI-Assisted Documentation | AI-Assisted Data Interpretation | AI-Powered Workflow Optimization | AI Product Ideation
                TECHNOLOGY & CLIENT OPERATIONS: Salesforce | Genesys | Kroll Platform | Cybersecurity Recovery & Identity Protection | Client & Case Management | CRM Management | Incident Documentation | QEval | Quality Evaluation

                EXPERIENCE
                Consultant – Cybersecurity & Client Operations | Etech
                March 2026 – Present | Remote / Freelance
                • Engage with clients impacted by cybersecurity and data-breach incidents to understand reported concerns and guide the recovery process.
                • Review and document information involved in data-security incidents, including identifying and recording potentially compromised client data.

                Co-Founder – Product & Project Operations | EasyNaukri
                July 2026 – Present | Remote
                • Co-developed and launched a live job-seeker automation platform designed to identify relevant vacancies based on candidate preferences and streamline job-application workflows.

                Consultant – Project Coordination & Client Operations | Etech
                October 2025 – February 2026 | Gujarat
                • Analyzed QEval datasets and leveraged Generative AI tools including ChatGPT and Claude to streamline reporting.

                Analytics Coordinator | Shopdeck Blitzscale Technologies
                April 2024 – September 2025 | Bangalore
                • Designed and developed interactive Tableau and Advanced Excel dashboards.

                Consultant Intern | HighRadius
                February 2022 – May 2022 | Bhubaneswar
                • Gathered and documented business requirements while working closely with stakeholders.

                Data Visualization Intern | Tata Steel
                April 2021 – June 2021 | Jamshedpur
                • Developed Tableau dashboards and performance reports.

                EDUCATION
                Bachelor of Technology – Computer Science
                Institute of Technical Education and Research, SOA University, Bhubaneswar | 2019–2023
                """;

        ParsedResumeDto dto = parserService.parseResume(resumeText.getBytes(), "text/plain", "Aamrin_Khan_CV.txt");

        System.out.println("=== JAVA RESUME PARSER SYSTEM OUTPUT ===");
        System.out.println("Candidate Name: " + dto.getName());
        System.out.println("Email: " + dto.getEmail());
        System.out.println("Phone: " + dto.getPhone());
        System.out.println("Location: " + dto.getLocation());
        System.out.println("Summary: " + dto.getSummary());
        System.out.println("Skills (" + (dto.getSkills() != null ? dto.getSkills().size() : 0) + "): " + dto.getSkills());
        System.out.println("Experience (" + (dto.getExperience() != null ? dto.getExperience().size() : 0) + "): " + dto.getExperience());
        System.out.println("Education (" + (dto.getEducation() != null ? dto.getEducation().size() : 0) + "): " + dto.getEducation());
        System.out.println("========================================");

        assertNotNull(dto);
        assertEquals("Aamrin Khan", dto.getName());
        assertEquals("aamrinjsr@gmail.com", dto.getEmail());
        assertEquals("+91-8002295666", dto.getPhone());
        assertEquals("India", dto.getLocation());
        assertTrue(dto.getSkills().size() >= 25, "Expected 25+ skills extracted");
        assertTrue(dto.getSkills().contains("Project Coordination"));
        assertTrue(dto.getSkills().contains("ChatGPT"));
        assertTrue(dto.getSkills().contains("Salesforce"));
        assertEquals(6, dto.getExperience().size(), "Expected 6 experience entries");
    }

    @Test
    public void testParseAnkitRoyResume() {
        String resumeText = """
                Ankit Roy Software Engineer
                ankit.roy0502@gmail.com | +91 9436797238 / +91 7308533439 | Gandhinagar, Gujarat
                linkedin.com/in/ankit-roy-898484144 | github.com/ankit-roy2k

                PROFESSIONAL EXPERIENCES
                Argusoft India Ltd. September 2022 – Present
                Solution Analyst
                • Contributed to the development and upgradation of a proprietary low-code platform, enabling 50% faster application deployment through configurations.
                • Played a key role in the design, development, testing, and deployment of the platform.
                • Collaborated with a cross-functional team of 10+ developers.

                Wipro March 2022 – May 2022
                Java J2EE Developer Intern
                • Engaged in comprehensive Java Enterprise Edition training.
                • Worked collaboratively with a team of 4 developers.

                HSPM Solutions LLP. June 2020 – September 2020
                Full Stack Web Developer Intern http://gg.gg/intern-hspm
                • Designed and delivered the web application LIONS CLUB DISTRICT 3234 D2.
                • Created full-fledged web solutions for BS AUTO ACCESSORIES and BR ENGINEERING WORKS.

                PROJECT
                Pehchan E-Learning https://github.com/ankit-roy2k/pehchan.git
                • Developed a touch-free attendance system using facial recognition.

                Shift to Smart https://shifttosmart.com
                • Built a web portal for Shift to Smart Services Pvt. Ltd.

                CERTIFICATION
                Cambridge Business English Certification (Vantage) http://gg.gg/becVantage

                EDUCATION
                Bachelor of Technology 2018 - 2022
                Computer Science and Engineering CGPA - 9.04
                Gandhi Institute For Technology, Bhubaneswar

                Higher Secondary 2016 - 2018
                CBSE (SCIENCE) Percentage - 66.80%
                BSF Sr. Sec. School, Shillong

                Secondary 2005 - 2016
                ICSE (10th) Percentage - 83.16%
                St. Edmund’s School, Shillong

                SKILLS
                Programming Languages
                Java, Python, JavaScript, PHP
                Frameworks & Tools
                React, Angular, Spring, Git, Postman, Docker
                Databases
                PostgreSQL, MySQL, MongoDB
                Soft Skills
                Data Structures & Algorithms, Public Speaking, Team Collaboration
                """;

        ParsedResumeDto dto = parserService.parseResume(resumeText.getBytes(), "text/plain", "Ankit_Roy_CV.txt");

        System.out.println("=== ANKIT ROY SYSTEM PARSER OUTPUT ===");
        System.out.println("Name: " + dto.getName());
        System.out.println("Email: " + dto.getEmail());
        System.out.println("Phone: " + dto.getPhone());
        System.out.println("Location: " + dto.getLocation());
        System.out.println("Skills: " + dto.getSkills());
        System.out.println("Experience: " + dto.getExperience());
        System.out.println("Education: " + dto.getEducation());
        System.out.println("Certifications: " + dto.getCertifications());
        System.out.println("======================================");

        assertEquals("Ankit Roy", dto.getName());
        assertEquals("ankit.roy0502@gmail.com", dto.getEmail());
        assertNotNull(dto.getPhone());
        assertEquals("Gandhinagar, Gujarat", dto.getLocation());
        assertTrue(dto.getSkills().contains("Java"));
        assertTrue(dto.getSkills().contains("React"));
        assertTrue(dto.getSkills().contains("PostgreSQL"));
        assertTrue(dto.getExperience().size() >= 3, "Expected 3 experience entries");
    }

    @Test
    public void testParseHarshSharmaResume() {
        String resumeText = """
                Harsh Sharma
                harsh1monu@gmail.com 7979880475 Kolkata LinkedIn Github

                SKILLS
                Programming Languages — C++, Python, C# Frontend — HTML, CSS, JavaScript, Angular
                Backend — Django, ASP .Net Others — Data Structures, Git, SQL, REST APIs, Agile, Azure DevOps

                PROFESSIONAL EXPERIENCE
                Accenture, Packaged App Development Associate Apr 2024 – Present | Kolkata
                Project: MyTE (My Time & Expenses)
                • Full stack developer for Time & Expenses Global IT Team
                • Developed robust logic for generating and modifying XML nodes following SOLID principles.

                LTIMindtree, IGNITE Intern Feb 2023 – Apr 2023
                • Completed a 9-week training and assessment program focused on Data Warehousing and Big Data.

                DRDO-PXE, Trainee/Intern Sep 2021 – Oct 2021 | Chandipur
                • Studied radar and high-speed imaging systems. Developed a Python program.

                PERSONAL PROJECTS
                Speech Emotion Recognition, Speech processing & Deep Learning
                • Created a speech signal classification system using machine learning and deep learning models.

                Doctor's Appointment System, backend Api endpoints
                • A backend project using Django for doctors to list their services.

                EDUCATION
                Bachelor's of Technology, C. V. Raman Global University Aug 2019 – Jul 2023 | Bhubaneswar
                • Electronics and Telecommunication Engineering | GPA: 8.59

                ACHIEVEMENTS
                Bright Beginners Award, Accenture Nov 2024
                Finalist, Smart India Hackathon 2022 26 Aug 2023

                CERTIFICATIONS
                Computer vision with OpenCV Neural Network & Deep Learning

                INTERESTS
                Reading Sports - Cricket Cooking
                """;

        ParsedResumeDto dto = parserService.parseResume(resumeText.getBytes(), "text/plain", "Harsh_Sharma_CV.txt");

        System.out.println("=== HARSH SHARMA SYSTEM PARSER OUTPUT ===");
        System.out.println("Name: " + dto.getName());
        System.out.println("Email: " + dto.getEmail());
        System.out.println("Phone: " + dto.getPhone());
        System.out.println("Location: " + dto.getLocation());
        System.out.println("Skills: " + dto.getSkills());
        System.out.println("Experience: " + dto.getExperience());
        System.out.println("Education: " + dto.getEducation());
        System.out.println("Certifications: " + dto.getCertifications());
        System.out.println("=========================================");

        assertEquals("Harsh Sharma", dto.getName());
        assertEquals("harsh1monu@gmail.com", dto.getEmail());
        assertEquals("7979880475", dto.getPhone());
        assertEquals("Kolkata", dto.getLocation());
        assertTrue(dto.getSkills().contains("Python"));
        assertTrue(dto.getSkills().contains("Angular"));
        assertTrue(dto.getSkills().contains("SQL"));
        assertTrue(dto.getExperience().size() >= 3, "Expected 3 experience entries");
    }

    @Test
    public void testParseMayankViroleResume() {
        String resumeText = """
                Mayank Virole
                Software Developer
                7828888144 | virolemayank@gmail.com | linkedin.com/in/mayank-virole/

                Experience
                Programmer Analyst July 2023 – Present
                ARGUSOFT Gandhinagar , Gujarat
                • Enhanced platform performance by 5% by optimizing SQL queries, implementing batch processing.
                • Improved reporting efficiency by 30%, enabling faster generation of critical healthcare insights.

                Technical Skills
                Programming Languages: Java, JavaScript, SQL, C++
                Frontend Technologies: React.js, Vue.js, AngularJS, HTML, CSS
                Developer Tools: Git, Maven, Postman, Dbeaver, Pgadmin4
                Backend Technologies : NodeJS, Spring Boot, Kafka, Debezium
                Database Management : MongoDB, PostgreSQL, MySQL

                Education
                Samrat Ashok Technological Institute Vidisha, Madhya Pradesh
                Bachelor of Technology ( Computer Science and Engineering ) (8.73 CGPA) July 2019 - May 2023

                Awards
                Employee of the Month Award Issued Jan 2025

                Certifications
                Full Stack Web Development with React - Coursera Issued Apr 2022
                Practical Java Course Zero to One - Coursera Issued Aug 2020
                """;

        ParsedResumeDto dto = parserService.parseResume(resumeText.getBytes(), "text/plain", "Mayank_Virole_CV.txt");

        System.out.println("=== MAYANK VIROLE SYSTEM PARSER OUTPUT ===");
        System.out.println("Name: " + dto.getName());
        System.out.println("Email: " + dto.getEmail());
        System.out.println("Phone: " + dto.getPhone());
        System.out.println("Location: " + dto.getLocation());
        System.out.println("Skills: " + dto.getSkills());
        System.out.println("Experience: " + dto.getExperience());
        System.out.println("Education: " + dto.getEducation());
        System.out.println("Certifications: " + dto.getCertifications());
        System.out.println("==========================================");

        assertEquals("Mayank Virole", dto.getName());
        assertEquals("virolemayank@gmail.com", dto.getEmail());
        assertEquals("7828888144", dto.getPhone());
        assertEquals("Gandhinagar, Gujarat", dto.getLocation());
        assertTrue(dto.getSkills().contains("Java"));
        assertTrue(dto.getSkills().contains("Spring Boot"));
        assertTrue(dto.getSkills().contains("React.js") || dto.getSkills().contains("React"));
        assertTrue(dto.getExperience().size() >= 1, "Expected at least 1 experience entry");
        assertTrue(dto.getEducation().size() >= 1, "Expected at least 1 education entry");
    }

    @Test
    public void testParseAmritKumarResume() {
        String resumeText = """
                Amrit Kumar
                India  amrit.399.ak@gmail.com  0878 949 83 34
                amritkumar199912  amritkr1999

                Full Stack Developer with a strong problem-solving mindset and the ability to quickly adapt to new technologies and environments. Skilled in designing and developing seamless, user-centric web applications across both frontend and backend. Experienced in independently delivering complete features, collaborating with cross-functional teams, and ensuring high-quality solutions in fast-paced environments. Adept at analyzing requirements, optimizing workflows, and integrating scalable architectures.

                Experience
                Argusoft, Programmer Analyst
                • Architected a streamlined workflow by collaborating with stakeholders to define requirements, integrated RESTful API using Spring Boot, PostgreSQL, and AngularJS
                • Collaborated with a cross-functional team of 10+ developers using Git and source control tools to adhere to design patterns, standards, and deployment activities.
                • Independently designed, developed, and delivered complete features across both frontend and backend, collaborating with the client to gather requirements and ensure seamless functionality.
                Gandhinagar, India
                Jan 2023 – Present

                Projects
                HUNGER HEROES
                • Worked on this project using HTML, CSS, and JavaScript. This is a food-based website.
                • Tools Used: HTML, CSS, and JavaScript

                ECOMMERCE WEBSITE
                • Developed a E-Commerce Website.
                • Tools Used: JAVA, HTML, CSS and Typescript

                Technologies
                Languages: C++, C, Java, SQL, JavaScript
                Frontend: Angular, ReactJS
                Backend: Java, PostgreSQL
                Others: Data Structures, GIT, SQL, REST APIs

                Education
                B.Tech Gandhi Institute For Technological Advancement, Computer Science
                • GPA: 8.64
                • Coursework: Computer Architecture, Comparison of Learning Algorithms, Computational Theory
                Aug 2019 – May 2023
                """;

        ParsedResumeDto dto = parserService.parseResume(resumeText.getBytes(), "text/plain", "Amrit_Kumar_CV.txt");

        System.out.println("=== AMRIT KUMAR SYSTEM PARSER OUTPUT ===");
        System.out.println("Name: " + dto.getName());
        System.out.println("Email: " + dto.getEmail());
        System.out.println("Phone: " + dto.getPhone());
        System.out.println("Location: " + dto.getLocation());
        System.out.println("Summary: " + dto.getSummary());
        System.out.println("Skills (" + (dto.getSkills() != null ? dto.getSkills().size() : 0) + "): " + dto.getSkills());
        System.out.println("Experience (" + (dto.getExperience() != null ? dto.getExperience().size() : 0) + "): " + dto.getExperience());
        System.out.println("Education (" + (dto.getEducation() != null ? dto.getEducation().size() : 0) + "): " + dto.getEducation());
        System.out.println("========================================");

        assertEquals("Amrit Kumar", dto.getName());
        assertEquals("amrit.399.ak@gmail.com", dto.getEmail());
        assertNotNull(dto.getPhone());
        assertEquals("Gandhinagar, India", dto.getLocation());
        assertNotNull(dto.getSummary(), "Summary should not be null");
        assertTrue(dto.getSummary().contains("Full Stack Developer"), "Summary should contain profile statement");
        assertTrue(dto.getSkills().contains("ReactJS") || dto.getSkills().contains("React"), "Expected React/ReactJS in skills");
        assertTrue(dto.getSkills().contains("Angular"), "Expected Angular in skills");
        assertEquals(1, dto.getExperience().size(), "Expected 1 experience entry");
        assertEquals("Programmer Analyst", dto.getExperience().get(0).get("title"), "Job title should be Programmer Analyst");
        assertEquals("Argusoft", dto.getExperience().get(0).get("company"), "Company name should be Argusoft");
        assertEquals(1, dto.getEducation().size(), "Expected 1 clean education entry");
    }
}
