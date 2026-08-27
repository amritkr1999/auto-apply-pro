import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw 'Page X of Y' headers and footers.
    """
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
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(HexColor("#475569"))
        
        # Header (Pages > 1)
        if self._pageNumber > 1:
            title = getattr(self, 'doc_title', 'AUTO APPLY PRO — PREPARATION GUIDE')
            self.drawString(54, 750, "AUTO APPLY PRO — INTERVIEW PREPARATION GUIDE")
            self.drawRightString(558, 750, title)
            self.setStrokeColor(HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(54, 742, 558, 742)

        # Footer (All pages)
        self.setFont("Helvetica", 8)
        self.setFillColor(HexColor("#64748B"))
        self.drawString(54, 36, "Confidential — Interview Mastery Document")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.setStrokeColor(HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, 48, 558, 48)
        
        self.restoreState()

def get_numbered_canvas_class(title_text):
    class DynamicNumberedCanvas(NumberedCanvas):
        doc_title = title_text
    return DynamicNumberedCanvas

def create_pm_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = HexColor("#0F172A")    # Deep Slate / Navy
    SECONDARY = HexColor("#1E3A8A")  # Royal Blue
    ACCENT = HexColor("#2563EB")     # Bright Blue
    TEXT_DARK = HexColor("#1E293B")  # Charcoal Text
    TEXT_MUTED = HexColor("#475569") # Slate Grey
    BG_LIGHT = HexColor("#F8FAFC")   # Off-white background
    BORDER_COLOR = HexColor("#E2E8F0")

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        alignment=TA_LEFT,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=ACCENT,
        alignment=TA_LEFT,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=6,
        alignment=TA_LEFT
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    qa_q_style = ParagraphStyle(
        'QA_Question',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=SECONDARY,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    qa_a_style = ParagraphStyle(
        'QA_Answer',
        parent=body_style,
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        leftIndent=8,
        spaceAfter=8
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=body_style,
        fontSize=8.5,
        leading=11.5,
        spaceAfter=0
    )
    
    table_header = ParagraphStyle(
        'TableHeader',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white,
        spaceAfter=0
    )

    story = []

    # Document Header Title Block
    story.append(Paragraph("Auto Apply Pro (EasyNaukri)", title_style))
    story.append(Paragraph("Project Manager & Product Owner Preparation Guide — Technical Interview Series", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceBefore=0, spaceAfter=12))

    # Executive Summary Card
    exec_summary_text = (
        "<b>Executive Summary:</b> Auto Apply Pro (operating under <i>easynaukri.online</i>) is an AI-powered job search "
        "automation platform and career enablement ecosystem. It eliminates candidate application fatigue by replacing "
        "repetitive manual job hunting, email drafting, and tracking with an intelligent multi-channel pipeline. "
        "This guide provides the complete Product Manager lens: market positioning, roadmap execution, user journeys, "
        "monetization strategy, KPI metrics, agile delivery, and interview response frameworks."
    )
    exec_table = Table(
        [[Paragraph(exec_summary_text, body_style)]],
        colWidths=[504]
    )
    exec_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(exec_table)
    story.append(Spacer(1, 10))

    # 1. Product Vision & Problem-Solution Fit
    story.append(Paragraph("1. Product Vision & Market Problem-Solution Fit", h1_style))
    story.append(Paragraph(
        "<b>The Industry Problem:</b> Tech professionals and active job seekers experience severe 'application fatigue'. "
        "A typical candidate applies to 100+ positions per month, spending 15-20 minutes per application tailoring resumes, "
        "drafting cold outreach emails to recruiters, and managing tracking spreadsheets. Manual conversion rates hover below 3-5%, "
        "leading to burnout and inefficient outreach.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Solution & Value Proposition:</b> Auto Apply Pro acts as a 24/7 personal career co-pilot. It seamlessly extracts "
        "Job Descriptions (JDs) via browser harvesting or vision OCR, matches candidate skills against requirements, drafts high-converting "
        "personalized cold emails, manages scheduled SMTP dispatch while preserving sender domain health, and integrates a learning hub "
        "for continuous upskilling.",
        body_style
    ))

    # 2. End-to-End User Journey & Workflow
    story.append(Paragraph("2. End-to-End User Journey & Product Workflow", h1_style))
    user_steps = [
        ("Step 1: Onboarding & Asset Setup", "Candidate registers, uploads master resume (PDF/Docx), defines target job titles, and configures dynamic skill matrix."),
        ("Step 2: Job Harvesting & OCR", "Jobs are harvested via Chrome Extension (Naukri, LinkedIn, Indeed, Instahyre, Wellfound) or image OCR screenshot upload (Instagram/LinkedIn posts)."),
        ("Step 3: AI Matching & Email Generation", "FastAPI Python pipeline processes JD details + Candidate profile to construct a targeted pitch highlighting overlapping technical competencies."),
        ("Step 4: Verification & Human-in-the-Loop", "Drafted emails enter candidate's Review Queue. Candidate reviews, customizes if necessary, and approves."),
        ("Step 5: Automated Dispatch & Tracking", "Spring Boot backend sends outreach email via rate-limited Zoho SMTP (smtppro.zoho.in) and updates dashboard status (Review -> Drafted -> Approved -> Sent -> Interviewing/Rejected)."),
        ("Step 6: Upskilling Loop", "Integrated Learning Space offers structured roadmaps, practice quizzes with immediate AI grading, and daily mock interview advice to improve interview pass rates.")
    ]
    for title, desc in user_steps:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))

    story.append(Spacer(1, 8))

    # 3. Product Architecture & Multi-Platform Strategy
    story.append(Paragraph("3. Monorepo Product Component Architecture", h1_style))
    
    comp_data = [
        [Paragraph("Component", table_header), Paragraph("Tech Stack", table_header), Paragraph("Product Purpose & PM Significance", table_header)],
        [Paragraph("Web SaaS Dashboard", table_cell), Paragraph("React 19, TypeScript, Vite, Tailwind CSS", table_cell), Paragraph("Core client portal for managing job pipelines, reviewing draft emails, tracking analytics, and accessing learning roadmaps.", table_cell)],
        [Paragraph("Backend REST API", table_cell), Paragraph("Java 21, Spring Boot 3, PostgreSQL, Redis", table_cell), Paragraph("Central business logic, user auth, database persistence, payment processing, rate-limited email scheduler.", table_cell)],
        [Paragraph("AI Pipeline", table_cell), Paragraph("Python FastAPI, Ollama (Deepseek/Llama3.1), Gemini", table_cell), Paragraph("Asynchronous AI engine for OCR text extraction, resume parsing, and personalized cold email generation.", table_cell)],
        [Paragraph("Mobile Client", table_cell), Paragraph("React Native, Expo SDK 56, NativeWind, Biometrics", table_cell), Paragraph("On-the-go outreach management, push tracking, background upload logs, and local biometric security (FaceID/TouchID).", table_cell)],
        [Paragraph("Browser Extension Node", table_cell), Paragraph("Chrome Manifest V3, Service Workers, DOM Scraper", table_cell), Paragraph("One-click job harvesting node embedded directly into Naukri, LinkedIn, Indeed, Instahyre, and Wellfound.", table_cell)]
    ]
    comp_table = Table(comp_data, colWidths=[110, 130, 264])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(comp_table)

    story.append(Spacer(1, 10))

    # 4. Feature Matrix (MVP vs V2 Release Roadmap)
    story.append(Paragraph("4. Feature Scope Matrix (MVP vs V2 Roadmap)", h1_style))
    matrix_data = [
        [Paragraph("Feature Module", table_header), Paragraph("Release Scope", table_header), Paragraph("Business Impact & PM Rationale", table_header)],
        [Paragraph("Automated Email Drafting", table_cell), Paragraph("MVP (Phase 1)", table_cell), Paragraph("Core value proposition. Reduces drafting time from 15 mins to 5 seconds per outreach.", table_cell)],
        [Paragraph("Rate-Limited SMTP Outreach", table_cell), Paragraph("MVP (Phase 1)", table_cell), Paragraph("Protects sender domain reputation and prevents Gmail/Zoho spam flagging.", table_cell)],
        [Paragraph("Job Pipeline & DB Tracking", table_cell), Paragraph("MVP (Phase 1)", table_cell), Paragraph("Replaces manual spreadsheets with status-driven relational database tracking.", table_cell)],
        [Paragraph("Multi-Channel Job Harvester", table_cell), Paragraph("MVP (Phase 1)", table_cell), Paragraph("Chrome Extension & Deepseek OCR allow capturing JDs from any website or image.", table_cell)],
        [Paragraph("Learning & Quiz Engine", table_cell), Paragraph("MVP (Phase 1)", table_cell), Paragraph("Increases daily user retention and provides candidate upskilling alongside job search.", table_cell)],
        [Paragraph("Razorpay + UPI Payment Flow", table_cell), Paragraph("MVP (Phase 1)", table_cell), Paragraph("Monetization strategy supporting subscriptions and manual UTR verification via Telegram bot.", table_cell)],
        [Paragraph("AI ATS Resume Optimizer", table_cell), Paragraph("Phase 2 (V2+)", table_cell), Paragraph("Parses resumes against ATS filters and gives keyword match scores.", table_cell)],
        [Paragraph("Multi-Profile Portfolio", table_cell), Paragraph("Phase 2 (V2+)", table_cell), Paragraph("Allows candidate to switch between Full Stack, Frontend, or AI Engineer personas.", table_cell)],
        [Paragraph("AI Mock Interview Platform", table_cell), Paragraph("Phase 2 (V2+)", table_cell), Paragraph("Interactive voice/text mock interviews with automated feedback scoring.", table_cell)]
    ]
    matrix_table = Table(matrix_data, colWidths=[120, 94, 290])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(matrix_table)

    story.append(Spacer(1, 10))

    # 5. Monetization Strategy & Business Operations
    story.append(Paragraph("5. Monetization Strategy & Business Operations", h1_style))
    story.append(Paragraph(
        "<b>Monetization Model:</b> Auto Apply Pro uses a hybrid SaaS pricing model:",
        body_style
    ))
    story.append(Paragraph("• <b>Free Tier (Freemium):</b> Up to 10 automated email drafts/month, basic job tracking, access to free learning roadmaps.", bullet_style))
    story.append(Paragraph("• <b>Pro Tier Subscription:</b> Unlimited AI outreach drafting, automated batch email dispatch, advanced learning quizzes, mobile biometric app access.", bullet_style))
    story.append(Paragraph("• <b>Dual Payment Pipeline:</b> Integrated with <b>Razorpay API</b> for automated card/netbanking checkout, and a custom <b>UPI Payment & UTR Submission System</b> for zero-fee Indian domestic payments. UTR numbers are verified via an automated <b>Telegram Bot Service</b> alerting system for immediate admin approval.", bullet_style))

    # 6. Agile Governance & Branching Strategy
    story.append(Paragraph("6. Agile Governance & Contribution Workflow", h1_style))
    story.append(Paragraph(
        "To ensure strict quality control in a modular monorepo environment, the project strictly enforces issue-based development:",
        body_style
    ))
    story.append(Paragraph("• <b>Issue-Driven Execution:</b> No code is written without an approved GitHub Issue assigned to the developer.", bullet_style))
    story.append(Paragraph("• <b>Branching Standard:</b> <code>main</code> (Production), <code>develop</code> (Staging Integration), <code>issue-&lt;num&gt;/&lt;short-desc&gt;</code> (Feature Branches).", bullet_style))
    story.append(Paragraph("• <b>CI/CD Pipeline:</b> GitHub Actions runs build checks and deploys automatically to Oracle Cloud Infrastructure (OCI) upon merging into <code>main</code>.", bullet_style))

    story.append(PageBreak()) # Clean break for Q&A section

    # 7. Candidate's Personal Contribution & Key Achievements
    story.append(Paragraph("7. Candidate's Key Role & Engineering Leadership", h1_style))
    story.append(Paragraph(
        "As the lead full-stack engineer and architect on Auto Apply Pro, your key achievements include:",
        body_style
    ))
    story.append(Paragraph("1. <b>Architected Monorepo Ecosystem:</b> Designed and built the complete 5-part monorepo (Spring Boot, FastAPI AI, React Vite, React Native Expo, Chrome Extension).", bullet_style))
    story.append(Paragraph("2. <b>Database Schema Refactoring:</b> Migrated monolithic candidate profiles into normalized relational schema with dedicated <code>skills</code> table and many-to-many <code>candidate_skills</code> join table.", bullet_style))
    story.append(Paragraph("3. <b>Multi-Engine AI Routing:</b> Designed Python FastAPI pipeline supporting local Ollama (Deepseek OCR, Llama 3.1:8b) for offline privacy and Google Gemini API for cloud high-speed fallback.", bullet_style))
    story.append(Paragraph("4. <b>Cross-Platform UI/UX Overhaul:</b> Implemented responsive global drawer navigation, dark/light theme contrast refactoring, and interactive modal image cropper for screenshot uploads.", bullet_style))
    story.append(Paragraph("5. <b>Payment & Telegram Verification Node:</b> Engineered Razorpay webhook listener and manual UPI UTR verification service with real-time Telegram admin notifications.", bullet_style))
    story.append(Paragraph("6. <b>Production Cloud Deployment:</b> Built Docker Compose production infrastructure and configured automated GitHub Actions deployment to OCI Compute with UFW/Fail2ban hardening.", bullet_style))

    story.append(Spacer(1, 10))

    # 8. PM Interview Questions & Strategic Model Answers
    story.append(Paragraph("8. Project Manager Interview Questions & Strategic Answers", h1_style))

    pm_qas = [
        ("Q1: How did you define the MVP scope versus future releases?",
         "Answer: I evaluated features based on Candidate Friction vs Implementation Complexity. The highest friction point was manual email drafting and application tracking. Hence, email AI generation, SMTP dispatch, and database tracking formed our MVP (Phase 1). Advanced features like AI ATS optimization and Mock Interviews were deferred to Phase 2 to ensure fast time-to-market."),

        ("Q2: How do you handle email deliverability and avoid sender domain blacklisting?",
         "Answer: Automated cold emailing carries a high risk of domain reputation damage. To mitigate this, we implemented strict queue rate-limiting in Spring Boot, required human approval before dispatch, set default sender headers using official Zoho domain handles (tech@easynaukri.online), and strictly capped outbound volume per hour per SMTP account."),

        ("Q3: What KPIs do you track to measure the product's success?",
         "Answer: We track 4 primary metrics: (1) Outreach Velocity (applications sent per user/week), (2) Response Rate (% of outreach resulting in recruiter replies), (3) Email Deliverability Rate (% sent without bounce-backs), and (4) Time-to-Application (reduction in minutes spent per job application)."),

        ("Q4: How did you manage technical trade-offs between local LLMs and cloud APIs?",
         "Answer: Local LLMs (Ollama Llama 3.1:8b) provide 100% data privacy and zero API cost but require high memory resources and introduce higher latency. Cloud APIs (Gemini 1.5 Flash/Pro) offer instant responses but incur per-token API costs. We built a dynamic fallback model: local execution for privacy-sensitive users, and cloud API fallback for high-throughput batch operations."),

        ("Q5: How did you coordinate cross-functional alignment across 5 monorepo components?",
         "Answer: We established clear interface contracts early using OpenAPI/Swagger specs for the backend and Pydantic schemas for the Python pipeline. Standardizing API requests enabled frontend, mobile, extension, and pipeline development to proceed concurrently without blocking dependencies."),

        ("Q6: How does the UPI UTR verification flow work and why was it introduced?",
         "Answer: In India, Razorpay gateway transactions incur a 2% fee. To offer a zero-fee payment option, we implemented direct UPI QR payments. Candidates enter their 12-digit UTR transaction reference, which triggers a instant Telegram notification to the admin bot. The admin can verify and unlock the Pro subscription with one click.")
    ]

    for q, a in pm_qas:
        story.append(Paragraph(q, qa_q_style))
        story.append(Paragraph(a, qa_a_style))

    doc.build(story, canvasmaker=get_numbered_canvas_class("Project Manager Guide"))
    print(f"Successfully generated: {filename}")

def create_dev_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    PRIMARY = HexColor("#0F172A")
    SECONDARY = HexColor("#0369A1")  # Cyan / Ocean Blue
    ACCENT = HexColor("#0D9488")     # Teal
    TEXT_DARK = HexColor("#1E293B")
    TEXT_MUTED = HexColor("#475569")
    BG_LIGHT = HexColor("#F8FAFC")
    CODE_BG = HexColor("#1E293B")
    CODE_TEXT = HexColor("#38BDF8")
    BORDER_COLOR = HexColor("#E2E8F0")

    title_style = ParagraphStyle(
        'DocTitleDev',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitleDev',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1Dev',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2Dev',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14.5,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextDev',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletDev',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    code_block = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=CODE_TEXT,
        spaceAfter=0
    )

    qa_q_style = ParagraphStyle(
        'QA_QuestionDev',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=SECONDARY,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    qa_a_style = ParagraphStyle(
        'QA_AnswerDev',
        parent=body_style,
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_DARK,
        leftIndent=8,
        spaceAfter=8
    )

    table_cell = ParagraphStyle('TableCellDev', parent=body_style, fontSize=8, leading=11, spaceAfter=0)
    table_header = ParagraphStyle('TableHeaderDev', parent=body_style, fontName='Helvetica-Bold', fontSize=8.5, leading=11.5, textColor=colors.white, spaceAfter=0)

    story = []

    # Title Block
    story.append(Paragraph("Auto Apply Pro (EasyNaukri)", title_style))
    story.append(Paragraph("Full Stack Developer & Technical Architect Preparation Guide — Deep-Dive Edition", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceBefore=0, spaceAfter=12))

    # Executive Tech Card
    exec_text = (
        "<b>Technical Overview:</b> Auto Apply Pro is built as a multi-tier production monorepo comprising a Spring Boot 3 Java backend, "
        "a Python FastAPI AI pipeline, a React 19 TypeScript web client, a React Native Expo mobile app, and a Manifest V3 Chrome Extension node. "
        "It leverages PostgreSQL for relational storage, Redis for caching, HikariCP for connection pooling, Ollama/Gemini for LLM processing, "
        "and is deployed via Docker Compose on Oracle Cloud Infrastructure (OCI). This document outlines full-stack architecture, schemas, "
        "data flows, deep technical challenges, code design patterns, and technical interview Q&A."
    )
    exec_table = Table([[Paragraph(exec_text, body_style)]], colWidths=[504])
    exec_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(exec_table)
    story.append(Spacer(1, 10))

    # 1. Monorepo Architecture & Technology Stack
    story.append(Paragraph("1. System Architecture & Tech Stack Details", h1_style))

    tech_stack_data = [
        [Paragraph("Subsystem", table_header), Paragraph("Technologies & Version", table_header), Paragraph("Key Architectural Libraries & Responsibilities", table_header)],
        [
            Paragraph("Backend API", table_cell),
            Paragraph("Java 21 (LTS), Spring Boot 3.3.x, Maven", table_cell),
            Paragraph("Spring Data JPA/Hibernate, Spring Security, JWT (HS256), HikariCP (30 max pool), Redis Cache, Zoho Mailer (STARTTLS), Razorpay SDK, Telegram Bot API.", table_cell)
        ],
        [
            Paragraph("AI Pipeline", table_cell),
            Paragraph("Python 3.9+, FastAPI, AsyncIO, Poetry", table_cell),
            Paragraph("Alembic DB migrations, Pydantic v2 schemas, Ollama API (Deepseek OCR Vision, Llama 3.1:8b), Google Gemini 1.5 API, PyPDF, python-docx.", table_cell)
        ],
        [
            Paragraph("Web Frontend", table_cell),
            Paragraph("React 19, TypeScript 5.6, Vite 6, Tailwind CSS", table_cell),
            Paragraph("React Router v7, React Dropzone, React Helmet Async, PostCSS, ESLint flat config. Responsive dashboard with global sidebar drawer.", table_cell)
        ],
        [
            Paragraph("Mobile App", table_cell),
            Paragraph("React Native 0.85, Expo SDK 56, Expo Router", table_cell),
            Paragraph("NativeWind (Tailwind CSS), TanStack React Query v5, Expo SecureStore, Expo LocalAuthentication (Biometrics: FaceID/TouchID), Reanimated v4.", table_cell)
        ],
        [
            Paragraph("Browser Node", table_cell),
            Paragraph("Chrome Manifest V3, Web API", table_cell),
            Paragraph("Background Service Workers, Content Scripts (LinkedIn/Naukri DOM parsers), Storage API, Offscreen document processing.", table_cell)
        ],
        [
            Paragraph("Infrastructure", table_cell),
            Paragraph("Docker 27, Docker Compose, PostgreSQL 17, Redis 7", table_cell),
            Paragraph("Oracle Cloud Infrastructure (OCI) Ubuntu instance, GitHub Actions CI/CD, Fail2ban security, UFW firewall, internal bridge networking.", table_cell)
        ]
    ]
    tech_table = Table(tech_stack_data, colWidths=[80, 134, 290])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('PADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(tech_table)

    story.append(Spacer(1, 10))

    # 2. Pipeline Flow & Technical Data Lifecycle
    story.append(Paragraph("2. Detailed Pipeline Data Lifecycle & Sequence", h1_style))
    story.append(Paragraph(
        "The end-to-end data lifecycle traverses 5 async stages across the system components:",
        body_style
    ))
    
    stages = [
        ("Stage 1: Job Description OCR & Extraction (`stage1_jd_extraction`)",
         "When a user uploads a JD screenshot or harvests via Chrome extension, <code>ocr_handler.py</code> sends base64 image bytes to Ollama's <code>/api/generate</code> endpoint running <b>deepseek-ocr</b> (or vision fallback). <code>jd_parser.py</code> parses raw text into a strict Pydantic model: <code>JobDescription(title, company, skills, recruiter_email, location, salary)</code>."),
        
        ("Stage 2: Resume Document Parsing (`stage2_resume_parsing`)",
         "The user's uploaded resume (PDF/DOCX) is processed by <code>file_loader.py</code> to extract raw text, which is passed to Ollama Llama 3.1:8b. Structured candidate data is mapped to <code>Candidate(name, email, skills, experience, education)</code>."),
        
        ("Stage 3: AI Email Generation (`stage3_email_gen`)",
         "<code>prompt_builder.py</code> constructs a targeted multi-shot prompt combining candidate experience and extracted job skills. <code>email_generator.py</code> invokes Llama 3.1:8b (or Gemini API) to generate a personalized cold outreach email subject line and body pitch."),
        
        ("Stage 4: Relational Persistence & State Transition (`stage4_storage` & Backend)",
         "Generated drafts are stored in PostgreSQL under state <code>DRAFTED</code>. When the candidate clicks 'Approve' in the React dashboard or Expo mobile app, state changes to <code>APPROVED</code>."),
        
        ("Stage 5: Scheduled SMTP Outreach (`smtp_sender.py` / Spring Boot Mailer)",
         "Spring Boot batch scheduler retrieves <code>APPROVED</code> applications and dispatches them via Zoho SMTP (<code>smtppro.zoho.in:587</code>) with STARTTLS encryption. Throttling logic enforces a maximum hourly rate to maintain sender score.")
    ]

    for title, text in stages:
        story.append(Paragraph(f"• <b>{title}:</b> {text}", bullet_style))

    story.append(Spacer(1, 10))

    # 3. Database Schema & Refactoring Details
    story.append(Paragraph("3. Relational Database Schema & Data Models", h1_style))
    story.append(Paragraph(
        "The PostgreSQL database (<code>autoapplypro</code>) is managed via JPA/Hibernate in Spring Boot and Alembic in the Python pipeline. Key schema entities:",
        body_style
    ))

    schema_items = [
        ("`candidates` Table", "Stores user profile data, full name, phone, bio, and binary resume stored as byte array BLOB (`resume_bytes`)."),
        ("`skills` & `candidate_skills` Tables", "Refactored many-to-many relationship allowing dynamic skill indexing, auto-completion, and fast SQL lookup."),
        ("`jobs` & `job_applications` Tables", "Stores extracted JD metadata, status (`REVIEW`, `DRAFTED`, `APPROVED`, `SENT`, `REJECTED`, `INTERVIEWING`), application timestamps, and recruiter emails."),
        ("`email_drafts` Table", "Stores subject line, generated pitch body, recipient email, fallback flags, and dispatch timestamp."),
        ("`plans`, `subscriptions`, `upi_payment_transactions`", "Billing schema supporting Razorpay subscription IDs, status (`ACTIVE`, `EXPIRED`), UPI transaction UTR numbers, payment status (`PENDING`, `VERIFIED`), and Telegram alert tracking IDs."),
        ("`learning_roadmaps`, `quizzes`, `user_quiz_attempts`", "Educational schema storing roadmaps, granular technical topics, subtopics, multiple-choice quiz questions, AI scoring results, and user completion progress.")
    ]
    for entity, details in schema_items:
        story.append(Paragraph(f"• <b>{entity}:</b> {details}", bullet_style))

    story.append(PageBreak()) # Clean page break for deep code & Q&A

    # 4. Backend Modular Structure & Spring Boot Config
    story.append(Paragraph("4. Backend Modular Architecture & Configuration", h1_style))
    story.append(Paragraph(
        "The backend is structured into 10 decoupled domain modules inside <code>com.backend.autoapplypro.modules</code>:",
        body_style
    ))
    
    modules_list = [
        ("users", "Candidate registration, authentication, resume BLOB upload, skill profile mapping."),
        ("jobs", "Job harvesting endpoints, application state transitions, company tracking."),
        ("outreach", "Cold email generation hooks, Zoho SMTP batch mailer, rate limiter."),
        ("learning", "Roadmaps, topics, practice quizzes, AI grading, progress analytics, daily advice."),
        ("billing", "Razorpay webhook controller, UPI payment service, Telegram bot notification engine, subscription gating."),
        ("feedback", "User bug reports and feature feedback submission."),
        ("govt_exams", "Specialized job tracking for government public sector examinations."),
        ("hr", "Recruiter candidate sourcing portal and job posting management."),
        ("referrals & referral_program", "User referral link generation, reward tracking, and invite conversion analytics.")
    ]
    for name, desc in modules_list:
        story.append(Paragraph(f"• <b><code>modules/{name}</code>:</b> {desc}", bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Spring Boot Multi-Profile Environment Setup:</b>", h2_style))
    story.append(Paragraph(
        "The backend supports 3 dynamic profiles: <code>default</code> (port 8060, standard redirect), "
        "<code>dev-local</code> (port 8080, paired with <code>VITE_API_PROXY_TARGET=http://localhost:8080</code>), "
        "and <code>dev-ngrok</code> (port 8060, targets ngrok secure tunnel for mobile & OAuth testing).",
        body_style
    ))

    # 5. Developer Interview Questions & Deep Technical Answers
    story.append(Paragraph("5. Technical Developer Interview Questions & Answers", h1_style))

    dev_qas = [
        ("Q1: How is authentication and authorization secured across web and mobile platforms?",
         "Answer: We implement Spring Security with a custom stateless JwtAuthenticationFilter. Upon login/OAuth2 callback (Google, GitHub, LinkedIn), the server issues an HS256 signed JWT token. The web client stores this token securely and appends it via HTTP Bearer Auth. The React Native mobile app stores the JWT in iOS Keychain / Android Keystore using `expo-secure-store`, protected by native biometric authentication (FaceID/TouchID) via `expo-local-authentication`."),

        ("Q2: How did you design database connection management for high throughput?",
         "Answer: We configured HikariCP connection pooling in `application.properties` with `maximum-pool-size=30`, `minimum-idle=5`, connection timeout of 20 seconds, and `leak-detection-threshold=2000ms`. This prevents connection exhaustion during concurrent batch AI email dispatches and API polling."),

        ("Q3: How does the Python FastAPI AI pipeline extract structured JSON from unstructured OCR text?",
         "Answer: We use Pydantic v2 schemas combined with Ollama's json format mode. The prompt enforces output matching our `JobDescription` or `Candidate` Pydantic models. If Ollama produces invalid JSON, Pydantic raises a ValidationError, triggering an automated cleanup retry loop before falling back to Google Gemini 1.5 API."),

        ("Q4: How did you implement the dual payment system (Razorpay + Manual UPI)?",
         "Answer: Razorpay uses webhook events (`payment.captured`) verified with HMAC-SHA256 signatures (`RazorpayConfig`). For manual UPI payments, candidates submit a 12-digit UTR reference number. `UpiPaymentService` creates a `UpiPaymentTransaction` record in state `PENDING` and triggers `TelegramBotService` to post an admin notification with inline approval buttons. When approved, `SubscriptionGatingService` instantly unlocks Pro access."),

        ("Q5: Explain your production deployment and CI/CD security architecture.",
         "Answer: Our deployment uses GitHub Actions (`backend-deploy.yml`) to build Docker images and trigger deployment via SSH on an OCI Ubuntu instance. The server runs Docker Compose with isolated bridge networks (`app-network`). PostgreSQL port 5432 and Backend port 8060 are securely bound to `127.0.0.1` and protected by UFW firewall and Fail2ban, preventing public exposure."),

        ("Q6: How did you refactor the Skills database and what was the impact?",
         "Answer: Originally, skills were stored as comma-separated strings inside `candidates`. This prevented efficient SQL filtering. I refactored the schema by creating an independent `skills` table and a `candidate_skills` join table (`@ManyToMany` in JPA). This reduced database redundancy, enabled instant auto-complete indexing, and sped up candidate skill-matching queries by 65%.")
    ]

    for q, a in dev_qas:
        story.append(Paragraph(q, qa_q_style))
        story.append(Paragraph(a, qa_a_style))

    doc.build(story, canvasmaker=get_numbered_canvas_class("Full Stack Developer Guide"))
    print(f"Successfully generated: {filename}")

if __name__ == '__main__':
    pm_pdf_path = "/Users/amrit/Development/work/auto-apply-pro/Auto_Apply_Pro_Project_Manager_Guide.pdf"
    dev_pdf_path = "/Users/amrit/Development/work/auto-apply-pro/Auto_Apply_Pro_Full_Stack_Developer_Guide.pdf"
    
    create_pm_pdf(pm_pdf_path)
    create_dev_pdf(dev_pdf_path)
