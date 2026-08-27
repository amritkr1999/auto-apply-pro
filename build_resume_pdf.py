import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
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
        self.drawRightString(558, 30, page_text)
        self.drawString(54, 30, "Amrit Kumar — Full Stack Developer Resume")
        self.setStrokeColor(HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 40, 558, 40)
        self.restoreState()

def build_resume():
    pdf_path = "/Users/amrit/Development/work/auto-apply-pro/Amrit_Kumar_Full_Stack_Resume.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=36,
        bottomMargin=45
    )
    
    styles = getSampleStyleSheet()
    
    PRIMARY = HexColor("#0F172A")    # Dark Slate
    ACCENT = HexColor("#2563EB")     # Blue accent
    TEXT_DARK = HexColor("#1E293B")  # Off black text
    MUTED = HexColor("#64748B")
    
    name_style = ParagraphStyle(
        'ResName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=22,
        textColor=PRIMARY,
        alignment=TA_CENTER,
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'ResSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=ACCENT,
        alignment=TA_CENTER,
        spaceAfter=4
    )

    contact_style = ParagraphStyle(
        'ResContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=TEXT_DARK,
        alignment=TA_CENTER,
        spaceAfter=8
    )

    h1_style = ParagraphStyle(
        'ResH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'ResBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_DARK,
        spaceAfter=3
    )

    muted_style = ParagraphStyle(
        'ResMuted',
        parent=body_style,
        textColor=MUTED
    )

    job_title_style = ParagraphStyle(
        'JobTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=PRIMARY
    )

    job_date_style = ParagraphStyle(
        'JobDate',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=ACCENT,
        alignment=2 # Right aligned
    )

    bullet_style = ParagraphStyle(
        'ResBullet',
        parent=body_style,
        leftIndent=10,
        firstLineIndent=-7,
        spaceAfter=2
    )

    story = []

    # Header
    story.append(Paragraph("AMRIT KUMAR", name_style))
    story.append(Paragraph("Full Stack Developer | Java 21 • Spring Boot • React 19 • Python FastAPI • AI & Cloud Systems", subtitle_style))
    story.append(Paragraph("Contact: +91-8789498334 &nbsp;|&nbsp; Email: amrit.399.ak@gmail.com &nbsp;|&nbsp; LinkedIn: linkedin.com/in/AmritKumar &nbsp;|&nbsp; GitHub: github.com/amritkr1999", contact_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=0, spaceAfter=6))

    # Professional Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", h1_style))
    summary_text = (
        "Full Stack Developer with 3+ years of experience architecting and delivering high-performance enterprise applications, "
        "microservices, and AI-driven platforms. Skilled in <b>Java 21 (Spring Boot, Hibernate, JPA)</b>, <b>Python (FastAPI, AsyncIO)</b>, "
        "<b>React 19</b>, <b>React Native (Expo)</b>, and <b>PostgreSQL</b>. Proven expertise in end-to-end system design, optimizing database queries "
        "by up to 40%, building scalable REST APIs, and deploying containerized applications on AWS and Oracle Cloud (OCI)."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 4))

    # Core Skills
    story.append(Paragraph("CORE SKILLS", h1_style))
    skills_data = [
        [Paragraph("<b>Programming Languages:</b>", body_style), Paragraph("Java 21 (LTS), Python 3.9+, TypeScript, JavaScript (ES6+), SQL, HTML5, CSS3, C++", body_style)],
        [Paragraph("<b>Backend & Frameworks:</b>", body_style), Paragraph("Spring Boot 3, Spring Security, JPA / Hibernate, RESTful API Design, Microservices, HikariCP, Kafka, Node.js, JWT", body_style)],
        [Paragraph("<b>AI & Data Engineering:</b>", body_style), Paragraph("Python FastAPI, AsyncIO, Ollama (Deepseek Vision OCR, Llama 3.1:8b), Pydantic v2, Google Gemini API, Alembic", body_style)],
        [Paragraph("<b>Frontend & Mobile:</b>", body_style), Paragraph("React 19, TypeScript, Vite, React Native (Expo SDK 56), NativeWind, Tailwind CSS, Chrome Extensions (Manifest V3)", body_style)],
        [Paragraph("<b>Databases & Caching:</b>", body_style), Paragraph("PostgreSQL 17 (Query Optimization, JPA Mappings), MySQL, MongoDB, Redis 7 Caching", body_style)],
        [Paragraph("<b>Cloud, DevOps & Tools:</b>", body_style), Paragraph("AWS (RDS, S3), Oracle Cloud Infrastructure (OCI), Docker, Docker Compose, GitHub Actions CI/CD, Git, Linux, Postman", body_style)]
    ]
    skills_table = Table(skills_data, colWidths=[120, 412])
    skills_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 1.5),
    ]))
    story.append(skills_table)
    story.append(Spacer(1, 4))

    # Professional Experience
    story.append(Paragraph("PROFESSIONAL EXPERIENCE", h1_style))

    # Ishavx
    t1 = Table([[Paragraph("Contract Full Stack Developer — Ishavx Technology", job_title_style), Paragraph("April 2026 – Present | Remote", job_date_style)]], colWidths=[360, 172])
    t1.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(t1)
    story.append(Paragraph("• Spearheaded end-to-end development of <b>VendorInfra</b>, a B2B vendor and contractor procurement platform for the Indian construction sector using Spring Boot, React, and PostgreSQL.", bullet_style))
    story.append(Paragraph("• Architected solution schema and managed cloud infrastructure on <b>AWS (S3, RDS)</b>, configuring automated deployment pipelines and secure database backups.", bullet_style))
    story.append(Spacer(1, 3))

    # Argusoft
    t2 = Table([[Paragraph("Solution Analyst (Full Stack Developer) — Argusoft", job_title_style), Paragraph("Jan 2023 – May 2026 | Gandhinagar", job_date_style)]], colWidths=[360, 172])
    t2.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(t2)
    story.append(Paragraph("• Co-developed <b>AROG</b>, an ABDM-compliant health management platform for clinics across Gujarat, digitizing clinical workflows, telemedicine, and EHR data interchange.", bullet_style))
    story.append(Paragraph("• Engineered high-throughput data processing routines for <b>Medplat</b> (National Health Data Platform), managing millions of public medical records while maintaining strict data integrity.", bullet_style))
    story.append(Paragraph("• Reduced server response times by <b>35%</b> and query execution latency by <b>40%</b> via PostgreSQL query tuning, JPA indexing, and DB schema optimization.", bullet_style))
    story.append(Paragraph("• Leveraged AI-assisted development tooling (Antigravity), improving feature delivery performance and engineering throughput by <b>30%</b>.", bullet_style))
    story.append(Paragraph("• Mentored and led a 3-member engineering team through code reviews, standard design patterns, and automated unit testing practices.", bullet_style))
    story.append(Spacer(1, 4))

    # Featured Projects
    story.append(Paragraph("FEATURED PROJECTS", h1_style))

    # Auto Apply Pro
    t3 = Table([[Paragraph("Auto Apply Pro (EasyNaukri) — AI Job Outreach & SaaS Platform", job_title_style), Paragraph("Full Stack Lead & Architect", job_date_style)]], colWidths=[370, 162])
    t3.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(t3)
    story.append(Paragraph("• <b>Multi-Tier Monorepo Architecture:</b> Architected an end-to-end 5-component monorepo system (Spring Boot 3 REST API, Python FastAPI AI engine, React 19 Vite web app, React Native Expo mobile app, Chrome Manifest V3 harvester extension).", bullet_style))
    story.append(Paragraph("• <b>Async AI & Vision OCR Pipeline:</b> Built a 5-stage Python AI pipeline leveraging Ollama (Deepseek Vision OCR & Llama 3.1:8b) and Google Gemini API fallback to parse multi-format resumes and generate targeted cold emails matching candidate skills to job requirements.", bullet_style))
    story.append(Paragraph("• <b>High-Performance Data Layer:</b> Optimized database performance by refactoring monolithic profiles into normalized JPA schemas (<code>candidate_skills</code> join table) and configuring HikariCP connection pooling, improving skill-matching query speeds by <b>65%</b>.", bullet_style))
    story.append(Paragraph("• <b>Payment Gateway & Telegram Bot Integration:</b> Implemented Razorpay SDK webhook listeners alongside a manual UPI UTR verification engine that triggers real-time Telegram admin bot alerts for instant subscription provisioning.", bullet_style))
    story.append(Paragraph("• <b>DevOps & Production Cloud Deployment:</b> Containerized services with Docker Compose and set up GitHub Actions CI/CD to deploy onto Oracle Cloud Infrastructure (OCI) with security hardening (Fail2ban, UFW, non-root containers).", bullet_style))
    story.append(Spacer(1, 3))

    # Other Projects Summary
    t4 = Table([[Paragraph("AROG & Medplat — Healthcare Data Platforms", job_title_style), Paragraph("Full Stack Developer", job_date_style)]], colWidths=[370, 162])
    t4.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(t4)
    story.append(Paragraph("• Digitized regional clinical workflows and national healthcare records adhering to ABDM standards, enabling secure multi-tenant EHR management and high-throughput data sync across government clinics.", bullet_style))
    story.append(Spacer(1, 4))

    # Education & Certifications
    story.append(Paragraph("EDUCATION & CERTIFICATIONS", h1_style))
    edu_data = [
        [Paragraph("<b>Bachelor of Technology (B.Tech) – Computer Science & Engineering</b>", body_style), Paragraph("2019 – 2023", job_date_style)],
        [Paragraph("Gandhi Institute for Technological Advancement (GITA), Bhubaneswar", muted_style), Paragraph("", body_style)]
    ]
    edu_table = Table(edu_data, colWidths=[380, 152])
    edu_table.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(edu_table)
    story.append(Spacer(1, 3))

    certs_text = (
        "• <b>Problem Solving:</b> Solved 200+ LeetCode problems focusing on Data Structures & Algorithms in Java (Dynamic Programming, Graph Theory).<br/>"
        "• <b>Certifications:</b> The Ultimate MySQL Bootcamp (Udemy); MongoDB - The Complete Developer's Guide (Udemy)."
    )
    story.append(Paragraph(certs_text, body_style))

    doc.build(story, canvasmaker=ResumeCanvas)
    print(f"Successfully generated resume: {pdf_path}")

if __name__ == '__main__':
    build_resume()
