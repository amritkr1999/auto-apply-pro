import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas

class ResumeCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(HexColor("#64748B"))
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 25, page_text)
        self.drawString(54, 25, "Amrit Kumar — Java Full Stack Developer Resume (AWS & Microservices)")
        self.setStrokeColor(HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 35, 558, 35)
        self.restoreState()

def build_tailored_resume():
    pdf_path = "/Users/amrit/Development/work/auto-apply-pro/Amrit_Kumar_Java_Full_Stack_Developer_Resume.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=32,
        bottomMargin=42
    )
    
    styles = getSampleStyleSheet()
    
    PRIMARY = HexColor("#0F172A")    # Dark Slate
    ACCENT = HexColor("#1D4ED8")     # Royal Blue
    TEXT_DARK = HexColor("#1E293B")  # Off black text
    MUTED = HexColor("#64748B")
    
    name_style = ParagraphStyle(
        'ResName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=19,
        leading=21,
        textColor=PRIMARY,
        alignment=TA_CENTER,
        spaceAfter=2
    )

    subtitle_style = ParagraphStyle(
        'ResSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=ACCENT,
        alignment=TA_CENTER,
        spaceAfter=3
    )

    contact_style = ParagraphStyle(
        'ResContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=TEXT_DARK,
        alignment=TA_CENTER,
        spaceAfter=6
    )

    h1_style = ParagraphStyle(
        'ResH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13.5,
        textColor=PRIMARY,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'ResBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.2,
        textColor=TEXT_DARK,
        spaceAfter=2.5
    )

    job_title_style = ParagraphStyle(
        'JobTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11.5,
        textColor=PRIMARY
    )

    job_date_style = ParagraphStyle(
        'JobDate',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11.5,
        textColor=ACCENT,
        alignment=TA_RIGHT
    )

    bullet_style = ParagraphStyle(
        'ResBullet',
        parent=body_style,
        leftIndent=10,
        firstLineIndent=-7,
        spaceAfter=2
    )

    muted_style = ParagraphStyle(
        'ResMuted',
        parent=body_style,
        textColor=MUTED
    )

    story = []

    # Header
    story.append(Paragraph("AMRIT KUMAR", name_style))
    story.append(Paragraph("Java Full Stack Developer | Java • Python • React.js • AWS Cloud & Microservices", subtitle_style))
    story.append(Paragraph("Location: Bangalore (Preferred) &nbsp;|&nbsp; Notice Period: 15–20 Days &nbsp;|&nbsp; Mobile: +91-8789498334<br/>Email: amrit.399.ak@gmail.com &nbsp;|&nbsp; LinkedIn: linkedin.com/in/AmritKumar &nbsp;|&nbsp; GitHub: github.com/amritkr1999", contact_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=0, spaceAfter=5))

    # Professional Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", h1_style))
    summary_text = (
        "Results-driven <b>Java Full Stack Developer</b> with 4 years of hands-on experience designing, developing, and deploying "
        "scalable web applications and microservices architectures using <b>Java (Spring Boot, Hibernate)</b>, <b>Python (FastAPI, Flask)</b>, "
        "and <b>React.js</b>. Proficient in cloud environment deployment on <b>AWS (EC2, S3, RDS, Lambda, CloudWatch)</b>, RESTful API design, "
        "and containerized CI/CD pipelines (Docker, Git). Experienced in both relational (PostgreSQL, MySQL) and NoSQL (MongoDB) databases. "
        "Known for writing clean unit-tested code (JUnit, Mockito), active code reviews, and delivering high-availability cloud solutions."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 3))

    # Core Skills
    story.append(Paragraph("CORE TECHNICAL SKILLS", h1_style))
    skills_data = [
        [Paragraph("<b>Backend Technologies:</b>", body_style), Paragraph("Java (Spring Boot, Hibernate, JPA, Spring Security, Spring MVC), Python (FastAPI, Flask), Microservices Architecture, RESTful APIs, JSON, Web Services", body_style)],
        [Paragraph("<b>Frontend Technologies:</b>", body_style), Paragraph("React.js, Redux, JavaScript (ES6+), HTML5, CSS3, Vite, Responsive UI Design", body_style)],
        [Paragraph("<b>AWS Cloud & Infrastructure:</b>", body_style), Paragraph("AWS EC2, AWS S3, AWS RDS (PostgreSQL/MySQL), AWS Lambda, AWS CloudWatch, AWS IAM", body_style)],
        [Paragraph("<b>Databases & Caching:</b>", body_style), Paragraph("Relational: PostgreSQL, MySQL | NoSQL: MongoDB | Caching: Redis 7", body_style)],
        [Paragraph("<b>DevOps & Tools:</b>", body_style), Paragraph("Docker, Docker Compose, Git, GitHub Actions, CI/CD Pipelines, Linux, Maven, Postman, Swagger/OpenAPI", body_style)],
        [Paragraph("<b>Testing & Methodology:</b>", body_style), Paragraph("JUnit, Mockito, Unit Testing, Integration Testing, Code Reviews, Agile/Scrum, System Design", body_style)]
    ]
    skills_table = Table(skills_data, colWidths=[125, 407])
    skills_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 1.2),
    ]))
    story.append(skills_table)
    story.append(Spacer(1, 3))

    # Professional Experience
    story.append(Paragraph("PROFESSIONAL EXPERIENCE", h1_style))

    # Ishavx
    t1 = Table([[Paragraph("Contract Full Stack Developer — Ishavx Technology", job_title_style), Paragraph("April 2026 – Present | Remote", job_date_style)]], colWidths=[360, 172])
    t1.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(t1)
    story.append(Paragraph("• Architected backend microservices using <b>Java Spring Boot</b> and <b>Python</b> for <b>VendorInfra</b>, a B2B procurement platform for the construction industry, serving responsive <b>React.js</b> UIs.", bullet_style))
    story.append(Paragraph("• Provisioned and maintained AWS Cloud infrastructure utilizing <b>AWS EC2</b> for app servers, <b>AWS RDS (PostgreSQL)</b> for database management, and <b>AWS S3</b> for document media storage.", bullet_style))
    story.append(Paragraph("• Implemented <b>AWS CloudWatch</b> for application log monitoring, server health metrics, and automated performance alert tracking.", bullet_style))
    story.append(Paragraph("• Established <b>Docker</b> containerized automated deployment pipelines, ensuring zero-downtime production updates.", bullet_style))
    story.append(Spacer(1, 3))

    # Argusoft
    t2 = Table([[Paragraph("Solution Analyst (Java Full Stack Developer) — Argusoft", job_title_style), Paragraph("Jan 2023 – May 2026 | Gandhinagar", job_date_style)]], colWidths=[360, 172])
    t2.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(t2)
    story.append(Paragraph("• Developed and scaled robust RESTful backend microservices in <b>Java (Spring Boot, Hibernate, JPA)</b> and <b>Python</b> for national health platforms (<b>AROG & Medplat</b>), processing millions of public medical records.", bullet_style))
    story.append(Paragraph("• Built dynamic, responsive front-end user interfaces using <b>React.js</b>, JavaScript, HTML5, and CSS3, integrating state management and REST API payload workflows.", bullet_style))
    story.append(Paragraph("• Optimized complex SQL queries and relational database schemas in <b>PostgreSQL and MySQL</b>, reducing server response times by <b>35%</b> and query execution latency by <b>40%</b>.", bullet_style))
    story.append(Paragraph("• Integrated NoSQL data storage using <b>MongoDB</b> for handling unstructured audit logs and high-throughput document payloads.", bullet_style))
    story.append(Paragraph("• Participated in rigorous code reviews, unit testing with <b>JUnit and Mockito</b>, and technical documentation to enforce software quality standards.", bullet_style))
    story.append(Paragraph("• Mentored a 3-member developer team through daily code reviews, sprint planning, and system design discussions.", bullet_style))
    story.append(Spacer(1, 3))

    # Featured Projects
    story.append(Paragraph("FEATURED PROJECTS", h1_style))

    # Auto Apply Pro
    t3 = Table([[Paragraph("Auto Apply Pro — AI Outreach & Cloud SaaS Platform", job_title_style), Paragraph("Full Stack Architect & Developer", job_date_style)]], colWidths=[370, 162])
    t3.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(t3)
    story.append(Paragraph("• <b>Full Stack Architecture:</b> Designed a multi-service platform combining a <b>Java Spring Boot 3</b> core REST API, a <b>Python (FastAPI)</b> AI engine, and a <b>React.js</b> single-page web client.", bullet_style))
    story.append(Paragraph("• <b>AWS Cloud & Serverless Integration:</b> Deployed backend microservices using <b>AWS S3</b> for document asset uploads, <b>AWS RDS (PostgreSQL)</b> for persistent state, and configured <b>AWS Lambda</b> serverless event triggers.", bullet_style))
    story.append(Paragraph("• <b>RESTful API & Database Optimization:</b> Refactored database schema using JPA Hibernate mappings, reducing query latencies by <b>65%</b> and enabling real-time REST API synchronization.", bullet_style))
    story.append(Paragraph("• <b>Docker & CI/CD Pipelines:</b> Built containerized application stack using <b>Docker Compose</b> and GitHub Actions CI/CD workflows for automated build, test, and deployment cycles.", bullet_style))
    story.append(Spacer(1, 3))

    # AROG & Medplat
    t4 = Table([[Paragraph("AROG & Medplat — Enterprise Healthcare Applications", job_title_style), Paragraph("Java / Python / React Developer", job_date_style)]], colWidths=[370, 162])
    t4.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(t4)
    story.append(Paragraph("• Designed high-availability healthcare microservices in Java and Python with React.js interfaces, ensuring ABDM compliance, secure EHR data interchange, and MongoDB/PostgreSQL database synchronization.", bullet_style))
    story.append(Spacer(1, 3))

    # Education & Certifications
    story.append(Paragraph("EDUCATION & CERTIFICATIONS", h1_style))
    edu_data = [
        [Paragraph("<b>Bachelor of Technology (B.Tech) – Computer Science & Engineering</b>", body_style), Paragraph("2019 – 2023", job_date_style)],
        [Paragraph("Gandhi Institute for Technological Advancement (GITA), Bhubaneswar", muted_style), Paragraph("", body_style)]
    ]
    edu_table = Table(edu_data, colWidths=[380, 152])
    edu_table.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(edu_table)
    story.append(Spacer(1, 2))

    certs_text = (
        "• <b>Problem Solving:</b> Solved 200+ Data Structures & Algorithms problems in Java (Dynamic Programming, Graph Theory).<br/>"
        "• <b>Certifications:</b> The Ultimate MySQL Bootcamp (Udemy); MongoDB - The Complete Developer's Guide (Udemy)."
    )
    story.append(Paragraph(certs_text, body_style))

    doc.build(story, canvasmaker=ResumeCanvas)
    print(f"Successfully generated JD-tailored resume: {pdf_path}")

if __name__ == '__main__':
    build_tailored_resume()
