# Agentic JD → Email Pipeline Architecture

**Project**: Auto Apply Pro - Local LLM Pipeline for Job Application Outreach  
**Date**: 2026-06-22  
**Environment**: macOS M5 chip, 16GB RAM, 512GB ROM  
**Models**: Deepseek OCR (Ollama), Ollama 3.1:8b  
**Language**: Python with asyncio  

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Component Breakdown](#component-breakdown)
3. [Project Structure](#project-structure)
4. [Data Models & Schemas](#data-models--schemas)
5. [Implementation Details](#implementation-details)
6. [Hardware Constraints & Optimization](#hardware-constraints--optimization)
7. [Implementation Sequence](#implementation-sequence)
8. [Testing Strategy](#testing-strategy)
9. [Integration with Backend](#integration-with-backend)
10. [Configuration](#configuration)
11. [Dependencies](#dependencies)

---

## High-Level Architecture

### Pipeline Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      INPUT SOURCES                              │
├─────────────────────────────────────────────────────────────────┤
│  LinkedIn | Naukari | Instagram | Other JD Screenshots           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│      STAGE 1: JD EXTRACTION (Deepseek OCR)                      │
├─────────────────────────────────────────────────────────────────┤
│  • Process screenshot image                                      │
│  • Extract: Title, Company, Location, Skills, Salary, etc       │
│  • Extract: Recruiter email (if present)                        │
│  • Output: Structured JD JSON                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│      STAGE 2: CANDIDATE RESUME PARSING                          │
├─────────────────────────────────────────────────────────────────┤
│  Input: PDF/DOCX/MD resume file                                 │
│  • Parse document (using suitable OCR/parser)                   │
│  • Convert to structured JSON format:                           │
│    - Name, Contact, Skills, Experience, Education              │
│  Output: Candidate JSON                                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┴──────────────────┐
         │                                    │
         ▼                                    ▼
    ┌─────────────────┐            ┌──────────────────┐
    │   JD JSON       │            │ Candidate JSON   │
    │  (Extracted)    │            │  (Structured)    │
    └────────┬────────┘            └────────┬─────────┘
             │                              │
             └──────────────┬───────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 3: EMAIL GENERATION (Ollama 3.1:8b)                      │
├─────────────────────────────────────────────────────────────────┤
│  Input: JD + Candidate Resume                                   │
│  • Analyze job fit                                              │
│  • Generate personalized email:                                 │
│    - Subject line                                               │
│    - Body (custom pitch based on skills match)                  │
│    - Closing                                                    │
│  • Extract recipient email (from JD or fallback logic)          │
│  Output: Email draft JSON                                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│          STAGE 4: EMAIL DISPATCH (Optional)                     │
├─────────────────────────────────────────────────────────────────┤
│  • Store email in SQLite database                               │
│  • Send via SMTP (Gmail/custom - optional)                      │
│  • Log status & recipient                                       │
│  • Generate report                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### **Stage 1: JD Extraction** 
**Purpose**: Screenshot → OCR → Structured extraction

| Module | Responsibility |
|--------|-----------------|
| `ocr_handler.py` | Wraps Ollama Deepseek vision API; sends image bytes to `/api/generate` endpoint; returns raw OCR text |
| `jd_parser.py` | Takes OCR text, uses LLM to structure it; extracts job_title, company, skills, salary, recruiter_email; returns `JobDescription` Pydantic model |
| `schemas.py` | Pydantic models: `JobDescription`, `Salary` |

**Key Decision**: 
- Use vision-capable Ollama endpoint for image processing
- LLM extraction (not regex) for better accuracy with varied formats

---

### **Stage 2: Resume Parsing**
**Purpose**: Multi-format resume → Candidate profile

| Module | Responsibility |
|--------|-----------------|
| `file_loader.py` | Detect format (PDF/DOCX/MD); extract text using `pypdf`, `python-docx`, or plaintext; returns normalized text |
| `resume_parser.py` | Uses Ollama 3.1:8b to extract structured info; extracts name, email, phone, skills, experience, education; returns `Candidate` model |
| `schemas.py` | Pydantic models: `Candidate`, `ExperienceEntry`, `Education` |

**Key Decision**:
- Separate file loading from LLM parsing for modularity
- LLM-based extraction handles resume variations

---

### **Stage 3: Email Generation**
**Purpose**: Combine JD + Candidate → Personalized email

| Module | Responsibility |
|--------|-----------------|
| `prompt_builder.py` | Crafts multi-shot prompt with context (recruiter name, company, candidate skills); returns formatted prompt string |
| `email_generator.py` | Calls Ollama 3.1:8b; generates subject + body; validates output; returns `Email` model |
| `schemas.py` | Pydantic models: `Email` |

**Key Decision**:
- Separate prompt construction from model calls
- Allows prompt testing/iteration without re-running inference

---

### **Stage 4: Storage & Dispatch**
**Purpose**: Persistence to PostgreSQL + optional SMTP dispatch

| Module | Responsibility |
|--------|-----------------|
| `postgres_manager.py` | PostgreSQL schema (emails table + metadata); CRUD operations; async connection pooling; migrations |
| `smtp_sender.py` | Optional SMTP dispatcher (config-gated); sends emails; updates status; respects rate limits |
| `schemas.py` | Pydantic models: `StoredEmail` |

**Key Decision**:
- PostgreSQL for persistent storage (integrates with existing Spring Boot backend)
- Async connection pooling with asyncpg for high performance
- SMTP optional and config-gated (MVP doesn't require sending)

---

### **Main Orchestrator**
**File**: `pipeline.py`

```python
class Pipeline:
    async def run(self, jd_image: Path, resume_file: Path, dry_run: bool = False):
        # Stage 1: JD extraction from image
        jd_text = await self.stage1.extract_ocr(jd_image)
        job_desc = await self.stage1.parse(jd_text)
        
        # Stage 2: Resume parsing from file
        resume_text = self.stage2.load_file(resume_file)
        candidate = await self.stage2.parse(resume_text)
        
        # Stage 3: Email generation
        email = await self.stage3.generate(job_desc, candidate)
        
        # Stage 4: Store (and optionally send)
        stored = await self.stage4.save(email)
        if not dry_run and self.config.smtp_enabled:
            await self.stage4.send(stored)
        
        return PipelineResult(status="success", email=email, stored_id=stored.id)
```

---

## Project Structure

```
auto-apply-pro/
├── pipeline/                           # NEW: Local agentic pipeline (Python)
│   ├── pyproject.toml                 # Poetry configuration
│   ├── requirements.txt                # Dependencies
│   ├── .env.example                    # Environment template (not committed)
│   ├── README.md                       # Setup & usage guide
│   │
│   ├── src/
│   │   ├── __init__.py
│   │   ├── config.py                   # Configuration, model paths, env vars
│   │   ├── models.py                   # Pydantic data models (shared)
│   │   ├── utils.py                    # Logging, validation, file helpers
│   │   ├── pipeline.py                 # Main orchestrator
│   │   │
│   │   ├── stage1_jd_extraction/
│   │   │   ├── __init__.py
│   │   │   ├── ocr_handler.py         # Ollama Deepseek vision wrapper
│   │   │   ├── jd_parser.py           # Extract JD fields from OCR text
│   │   │   └── schemas.py              # JobDescription, Salary models
│   │   │
│   │   ├── stage2_resume_parsing/
│   │   │   ├── __init__.py
│   │   │   ├── file_loader.py         # PDF/DOCX/MD loader
│   │   │   ├── resume_parser.py       # Extract candidate from text
│   │   │   └── schemas.py              # Candidate, Experience, Education models
│   │   │
│   │   ├── stage3_email_gen/
│   │   │   ├── __init__.py
│   │   │   ├── prompt_builder.py      # Build personalized prompts
│   │   │   ├── email_generator.py     # Ollama 3.1:8b calls
│   │   │   └── schemas.py              # Email model
│   │   │
│   │   └── stage4_storage/
│   │       ├── __init__.py
│   │       ├── postgres_manager.py    # PostgreSQL connection & CRUD
│   │       ├── migrations.py           # Database migrations (Alembic)
│   │       ├── smtp_sender.py         # Optional email dispatch
│   │       └── schemas.py              # StoredEmail model
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_stage1.py              # JD extraction tests
│   │   ├── test_stage2.py              # Resume parsing tests
│   │   ├── test_stage3.py              # Email generation tests
│   │   ├── test_stage4.py              # Storage tests
│   │   ├── test_integration.py         # End-to-end tests
│   │   ├── conftest.py                 # Pytest fixtures
│   │   └── fixtures/
│   │       ├── sample_jd.png           # Test JD screenshot
│   │       ├── sample_resume.pdf       # Test resume
│   │       └── sample_resume.docx
│   │
│   ├── examples/
│   │   ├── pipeline_example.py         # End-to-end usage
│   │   ├── stage1_example.py           # JD extraction only
│   │   ├── stage2_example.py           # Resume parsing only
│   │   └── stage3_example.py           # Email generation only
│   │
│   ├── data/
│   │   ├── cache/                      # Model cache (Ollama models)
│   │   └── migrations/                 # Database migration scripts
│   │
│   └── logs/
│       └── pipeline.log               # Pipeline execution logs
```

---

## Data Models & Schemas

### **Stage 1: JobDescription**

```python
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class Salary(BaseModel):
    min: Optional[int] = None
    max: Optional[int] = None
    currency: str = "USD"

class JobDescription(BaseModel):
    job_title: str
    company: str
    skills: List[str]
    salary: Optional[Salary] = None
    recruiter_email: Optional[str] = None
    experience_required: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None  # Full-time, Contract, etc
    raw_ocr_text: str
    source_filename: str
    extracted_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "job_title": "Senior Python Developer",
                "company": "TechCorp",
                "skills": ["Python", "FastAPI", "PostgreSQL"],
                "salary": {"min": 120000, "max": 150000, "currency": "USD"},
                "recruiter_email": "hr@techcorp.com",
                "location": "San Francisco, CA",
                "job_type": "Full-time",
                "extracted_at": "2026-06-22T10:30:00Z"
            }
        }
```

### **Stage 2: Candidate**

```python
from datetime import datetime
from typing import Optional, List

class ExperienceEntry(BaseModel):
    title: str
    company: str
    duration: Optional[str] = None
    description: Optional[str] = None

class Education(BaseModel):
    degree: str
    institution: str
    graduation_year: Optional[int] = None
    field_of_study: Optional[str] = None

class Candidate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    skills: List[str]
    experience: List[ExperienceEntry]
    education: List[Education]
    certifications: List[str] = []
    summary: Optional[str] = None
    raw_text: str
    source_filename: str
    parsed_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+1-555-0100",
                "skills": ["Python", "FastAPI", "AWS"],
                "experience": [
                    {
                        "title": "Senior Developer",
                        "company": "TechCorp",
                        "duration": "2021-2024"
                    }
                ],
                "education": [
                    {
                        "degree": "B.S.",
                        "institution": "State University",
                        "graduation_year": 2018
                    }
                ]
            }
        }
```

### **Stage 3: Email**

```python
from datetime import datetime

class Email(BaseModel):
    recipient_email: str
    recipient_name: Optional[str] = None
    subject: str
    body: str
    generated_at: datetime
    jd_source: str
    candidate_source: str
    job_title: str
    company: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "recipient_email": "hr@company.com",
                "recipient_name": "Hiring Manager",
                "subject": "Experienced Python Developer - [Company Name]",
                "body": "Dear Hiring Manager...",
                "job_title": "Senior Python Developer",
                "company": "TechCorp"
            }
        }
```

### **Stage 4: StoredEmail**

```python
from datetime import datetime
from typing import Optional

class StoredEmail(BaseModel):
    id: Optional[int] = None
    recipient_email: str
    recipient_name: Optional[str] = None
    subject: str
    body: str
    status: str  # "pending", "sent", "failed", "draft"
    generated_at: datetime
    sent_at: Optional[datetime] = None
    job_title: str
    company: str
    candidate_name: str
    error_message: Optional[str] = None
    retry_count: int = 0
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "recipient_email": "hr@company.com",
                "subject": "Experienced Python Developer - [Company Name]",
                "status": "pending",
                "generated_at": "2026-06-22T10:30:00Z",
                "job_title": "Senior Python Developer",
                "company": "TechCorp",
                "candidate_name": "John Doe"
            }
        }
```

---

## Implementation Details

### **Critical Decisions**

#### 1. **Data Structures**
- ✅ All stages use **Pydantic models** for validation & serialization
- ✅ Enables JSON storage and inter-stage passing
- ✅ Type safety catches bugs early
- ✅ Timestamps in UTC (ISO format) for audit trails

#### 2. **Async & Concurrency**
- ✅ Use `asyncio` for **I/O-bound operations** (HTTP calls to Ollama, file reads)
- ✅ Keep model inference **sequential** (respects Ollama's request queue)
- ✅ Pattern: `async def stage_x() -> await ollama_call()`
- ⚠️ **NOT parallel**: Don't load multiple models simultaneously (causes OOM on 16GB)

#### 3. **Model Loading Strategy**
```
Timeline for 16GB M5 Mac:

1. Start: Free RAM ~6GB
2. Load Deepseek vision (~7GB) → Free RAM ~1GB
3. Process Stage 1 (JD extraction) → Free RAM varies
4. Unload Deepseek (optional, can keep)
5. Load Ollama 3.1:8b (~5GB) → Free RAM ~2-3GB
6. Process Stages 2-3 (resume + email) → Uses 3.1:8b
7. Store results in SQLite
8. Repeat for next JD/resume pair
```

**Memory Monitoring**:
```python
import psutil

memory_percent = psutil.virtual_memory().percent
if memory_percent > 90:
    logger.warning(f"High memory usage: {memory_percent}%")
    # Wait for garbage collection or pause
    await asyncio.sleep(5)
```

#### 4. **Caching & Connection Pooling**
- Single `aiohttp.ClientSession` reused across all stages
- Respects Ollama rate limits (default: ~1 request/sec per model)
- Cache directory: `/home/user/.ollama/models` (Ollama default)

#### 5. **Error Handling**
- **Per-stage retries**: OCR fails → retry with different temperature
- **Partial failures**: Stages are independent → one failure doesn't block others
- **Graceful degradation**: Missing recruiter email → log and use fallback
- **Connection loss**: Detect Ollama connection errors, suggest restart

---

## Hardware Constraints & Optimization

### **Hardware Profile**
- **CPU**: Apple M5 (8-core GPU)
- **RAM**: 16GB (limiting factor)
- **Storage**: 512GB ROM (ample for Ollama models)

### **Model Sizes**
| Model | Size | RAM Required |
|-------|------|--------------|
| Deepseek Vision | ~7GB | 7GB |
| Ollama 3.1:8b | ~5GB | 5GB |
| System + Python | ~2GB | 2GB |
| **Total for both** | ~12GB | ~12GB |
| **Safe headroom** | - | ~2GB |

### **Optimization Strategies**

#### 1. **Batch Processing**
```python
# Process emails in batches of 5
BATCH_SIZE = 5

async def process_batch(jd_images: List[Path], resume_file: Path):
    for jd_image in jd_images:
        email = await pipeline.run(jd_image, resume_file, dry_run=True)
        await storage.save(email)
        # Optional: unload model and wait
        if memory_usage() > 14GB:
            logger.info("Memory threshold reached, pausing...")
            await asyncio.sleep(10)
```

#### 2. **Model Reuse**
- Load Deepseek once, process all JD images
- Load Ollama 3.1:8b once, use for both resume parsing and email generation
- Unload models only when switching to next batch

#### 3. **Connection Pooling**
```python
class OllamaClient:
    def __init__(self):
        self.session = aiohttp.ClientSession()
    
    async def call(self, model: str, prompt: str, **kwargs):
        async with self.session.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={"model": model, "prompt": prompt, **kwargs}
        ) as resp:
            return await resp.json()
```

#### 4. **Storage Efficiency**
- Use PostgreSQL connection pooling (async via asyncpg)
- Index on `recipient_email`, `status`, and `created_at` for quick queries
- Archive old emails to archive tables via retention policies
- Leverage PostgreSQL's JSONB for metadata storage

---

## Implementation Sequence

### **Phase 1: Core Infrastructure** (4-5 days)
1. Set up Poetry/pip, project structure, .env template
2. Create `config.py` (Ollama endpoints, database URL, timeouts, model names)
3. Create `models.py` (all Pydantic schemas)
4. Create `utils.py` (logging, validation helpers)
5. Set up PostgreSQL connection pooling with asyncpg
6. Create database migrations (Alembic) for email schema
7. Create `postgres_manager.py` (async CRUD operations)

**Deliverable**: Project scaffold + PostgreSQL connection ready + migrations set up

---

### **Phase 2: Stage 1 - JD Extraction** (5-7 days)
1. Implement `ocr_handler.py` (Ollama vision API wrapper)
   - Load image file
   - Send to Ollama `/api/generate` endpoint
   - Parse response
2. Implement `jd_parser.py` (LLM-based extraction to JSON)
   - Craft extraction prompt
   - Call Ollama 3.1:8b
   - Validate output against `JobDescription` schema
3. Write tests with sample JD screenshot
4. Verify: screenshot → JD JSON (manual test with real LinkedIn/Naukari screenshot)

**Deliverable**: Stage 1 working, can extract job titles, companies, skills, emails

---

### **Phase 3: Stage 2 - Resume Parsing** (4-5 days)
1. Implement `file_loader.py` (PDF/DOCX/MD support)
   - Detect format by extension and magic bytes
   - Use `pypdf` for PDF (text extraction only)
   - Use `python-docx` for DOCX
   - Read MD as plaintext
2. Implement `resume_parser.py` (LLM-based candidate extraction)
   - Craft extraction prompt
   - Call Ollama 3.1:8b
   - Validate output against `Candidate` schema
3. Write tests with sample resumes (PDF, DOCX)
4. Verify: resume file → Candidate JSON

**Deliverable**: Stage 2 working, can extract candidate info from multiple formats

---

### **Phase 4: Stage 3 - Email Generation** (5-7 days)
1. Implement `prompt_builder.py`
   - Craft multi-shot prompt with JD + Candidate context
   - Include examples of good emails
   - Instruct model to reference JD specifics
2. Implement `email_generator.py`
   - Call Ollama 3.1:8b with prompt
   - Parse subject + body from response
   - Validate (non-empty, reasonable length)
   - Handle timeouts and retries
3. Write tests with mock JD + Candidate
4. Verify: JD + Candidate → Email JSON with personalized subject & body

**Deliverable**: Stage 3 working, generates contextual emails

---

### **Phase 5: Stage 4 - Storage & Optional Dispatch** (4-5 days)
1. Implement PostgreSQL CRUD in `postgres_manager.py`
   - Create async connection pool (asyncpg)
   - Implement `save_email()`, `get_email()`, `list_pending()`, `mark_sent()`, `mark_failed()`
   - Add auto-retry logic with exponential backoff
   - Implement transaction handling for consistency
2. Set up Alembic migrations
   - Create email schema migration
   - Add indexes on frequently queried columns
3. Implement `smtp_sender.py` (optional, config-gated)
   - Respect SMTP rate limits
   - Update status in PostgreSQL
   - Handle connection pooling gracefully
4. Write tests with test database
5. Verify: Email stored in PostgreSQL, status tracked, can query backend DB

**Deliverable**: Stage 4 working, emails persisted to PostgreSQL backend database

---

### **Phase 6: Main Orchestrator** (3-4 days)
1. Implement `pipeline.py` (tie all stages together)
2. Handle async/await across stages
3. Implement backpressure & memory monitoring
4. Add logging checkpoints at each stage
5. Support `dry_run` mode (don't send emails)

**Deliverable**: Full pipeline executable end-to-end

---

### **Phase 7: Testing & Documentation** (4-5 days)
1. Write integration tests (full pipeline)
2. Create example scripts (`examples/`)
3. Document setup in `README.md`
4. Create CLAUDE.md for future development
5. Dry-run with real data (no SMTP)

**Deliverable**: Tested pipeline, ready for deployment

---

### **Phase 8: Integration with Backend** (2-3 days)
1. Create REST endpoint or sync service to push generated emails to Spring Boot backend
   - Option A: Python sends POST to `/api/drafts`
   - Option B: Separate sync service reads SQLite, pushes to backend
2. Map `StoredEmail` fields to Spring `EmailOutreach` entity
3. Test round-trip: Pipeline → SQLite → Backend → UI

**Deliverable**: Seamless integration with existing Auto Apply Pro system

---

## Testing Strategy

### **Stage 1: JD Extraction**

```python
# tests/test_stage1.py

@pytest.mark.asyncio
async def test_ocr_handler_with_real_image():
    """Load sample_jd.png, call Ollama, verify text output"""
    handler = OCRHandler(config)
    text = await handler.extract_ocr("tests/fixtures/sample_jd.png")
    assert len(text) > 100
    assert any(keyword in text.lower() for keyword in ["position", "job", "role"])

@pytest.mark.asyncio
async def test_jd_parser_extracts_fields():
    """Parse OCR text, verify JobDescription model"""
    parser = JDParser(config)
    jd = await parser.parse(sample_ocr_text)
    assert jd.job_title != ""
    assert jd.company != ""
    assert len(jd.skills) > 0
    assert jd.extracted_at is not None

@pytest.mark.asyncio
async def test_jd_parser_handles_missing_email():
    """If no email found, should handle gracefully"""
    parser = JDParser(config)
    jd = await parser.parse(ocr_text_without_email)
    assert jd.recruiter_email is None or jd.recruiter_email == ""
    # Verify other fields are still extracted
    assert jd.job_title != ""
```

### **Stage 2: Resume Parsing**

```python
# tests/test_stage2.py

def test_file_loader_pdf():
    """Load PDF, extract text"""
    loader = FileLoader(config)
    text = loader.load("tests/fixtures/sample_resume.pdf")
    assert len(text) > 50
    assert "@" in text

def test_file_loader_docx():
    """Load DOCX, extract text"""
    loader = FileLoader(config)
    text = loader.load("tests/fixtures/sample_resume.docx")
    assert len(text) > 50

@pytest.mark.asyncio
async def test_resume_parser_extracts_fields():
    """Parse resume text, verify Candidate model"""
    parser = ResumeParser(config)
    candidate = await parser.parse(sample_resume_text)
    assert candidate.name != ""
    assert candidate.email != ""
    assert len(candidate.skills) > 0
    assert len(candidate.experience) >= 0
```

### **Stage 3: Email Generation**

```python
# tests/test_stage3.py

def test_prompt_builder_includes_context():
    """Verify prompt includes JD + Candidate details"""
    builder = PromptBuilder(config)
    prompt = builder.build(sample_jd, sample_candidate)
    assert sample_jd.job_title in prompt
    assert sample_candidate.name in prompt
    assert "skills" in prompt.lower()

@pytest.mark.asyncio
async def test_email_generator_produces_valid_email():
    """Generate email, verify Email model"""
    gen = EmailGenerator(config)
    email = await gen.generate(sample_jd, sample_candidate)
    assert email.recipient_email == sample_jd.recruiter_email
    assert len(email.subject) > 10
    assert len(email.body) > 50
```

### **Stage 4: Storage**

```python
# tests/test_stage4.py

@pytest.mark.asyncio
async def test_postgres_manager_saves_email():
    """Save email to PostgreSQL, verify it's stored"""
    manager = PostgresManager(config)
    async with manager.get_connection() as conn:
        stored = await manager.save_email(conn, sample_email)
        assert stored.id is not None
        assert stored.status == "pending"

@pytest.mark.asyncio
async def test_postgres_manager_retrieves_email():
    """Retrieve email from PostgreSQL, verify fields match"""
    manager = PostgresManager(config)
    async with manager.get_connection() as conn:
        stored = await manager.save_email(conn, sample_email)
        retrieved = await manager.get_email(conn, stored.id)
        assert retrieved.recipient_email == sample_email.recipient_email

@pytest.mark.asyncio
async def test_postgres_manager_connection_pool():
    """Verify connection pooling works correctly"""
    manager = PostgresManager(config)
    assert manager.pool is not None
    async with manager.get_connection() as conn:
        result = await conn.fetchval("SELECT 1")
        assert result == 1
```

### **Integration Test**

```python
# tests/test_integration.py

@pytest.mark.asyncio
async def test_full_pipeline_end_to_end():
    """Run full pipeline: JD image → Resume → Email → PostgreSQL"""
    pipeline = Pipeline(config)
    result = await pipeline.run(
        jd_image=Path("tests/fixtures/sample_jd.png"),
        resume_file=Path("tests/fixtures/sample_resume.pdf"),
        dry_run=True
    )
    assert result.status == "success"
    assert result.email.recipient_email != ""
    assert result.stored_id is not None
    
    # Verify email is persisted in PostgreSQL
    manager = PostgresManager(config)
    async with manager.get_connection() as conn:
        stored = await manager.get_email(conn, result.stored_id)
        assert stored.status == "pending"
        assert stored.candidate_name != ""
```

---

## Integration with Backend

### **Option A: Python Pipeline → Spring REST API (Recommended)**

After Stage 4 saves to SQLite, Python pipeline POSTs to Spring Backend:

```python
# In pipeline.py or smtp_sender.py

async def sync_to_backend(stored_email: StoredEmail):
    """Push generated email to Spring Backend"""
    payload = {
        "recipientEmail": stored_email.recipient_email,
        "subject": stored_email.subject,
        "body": stored_email.body,
        "jobTitle": stored_email.job_title,
        "company": stored_email.company,
        "candidateName": stored_email.candidate_name,
        "status": "draft"
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{BACKEND_API_URL}/api/drafts",
            json=payload,
            headers={"Authorization": f"Bearer {API_TOKEN}"}
        ) as resp:
            if resp.status == 201:
                logger.info(f"Email synced to backend: {stored_email.id}")
            else:
                logger.error(f"Sync failed: {await resp.text()}")
```

**Endpoint Expected**:
```
POST /api/drafts
Content-Type: application/json
Authorization: Bearer <token>

{
  "recipientEmail": "hr@company.com",
  "subject": "Application for Senior Python Developer",
  "body": "Dear Hiring Manager...",
  "jobTitle": "Senior Python Developer",
  "company": "TechCorp",
  "candidateName": "John Doe",
  "status": "draft"
}

Response: 201 Created
{
  "id": 42,
  "recipientEmail": "hr@company.com",
  ...
}
```

**Mapping to Existing Spring Entities**:
```
StoredEmail (Python)  →  EmailOutreach (Spring)
├─ recipient_email   →  recruiterEmail
├─ subject           →  emailSubject (or subject)
├─ body              →  emailBody (or content)
├─ job_title         →  jobTitle
├─ company           →  company
├─ candidate_name    →  candidateName
└─ status            →  status (draft/pending/sent)
```

### **Option B: SQLite Sync Service**

Separate service reads from Python SQLite, pushes to backend:
- Cleaner separation but adds extra component
- Useful if pipeline runs offline or batched

---

## Configuration

### **.env File Template** (`.env.example`)

```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEEPSEEK_MODEL=deepseek-vision:7b
OLLAMA_LLM_MODEL=ollama3.1:8b
OLLAMA_TIMEOUT_SECONDS=120
OLLAMA_TEMPERATURE=0.7

# Pipeline Configuration
PIPELINE_BATCH_SIZE=5
PIPELINE_MEMORY_THRESHOLD_GB=14
PIPELINE_MEMORY_CHECK_INTERVAL_SECONDS=30
PIPELINE_RETRY_ATTEMPTS=3
PIPELINE_DRY_RUN=true

# PostgreSQL Configuration
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/auto_apply_pro
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=5
DATABASE_POOL_TIMEOUT_SECONDS=30
DATABASE_ECHO_SQL=false

# Storage Configuration
STORAGE_ARCHIVE_AFTER_DAYS=30
STORAGE_RETENTION_POLICY_ENABLED=true

# Optional: SMTP Configuration (disabled by default)
SMTP_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=Auto Apply Pro
SMTP_RATE_LIMIT_SECONDS=5

# Backend Integration (Spring Boot API)
BACKEND_API_URL=http://localhost:8060
BACKEND_API_TOKEN=your-api-token
BACKEND_SYNC_ENABLED=true
BACKEND_SYNC_INTERVAL_SECONDS=60

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/pipeline.log
LOG_FORMAT=json

# Application
APP_ENV=development
APP_DEBUG=false
```

### **Python Config Class**

```python
# src/config.py

from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_deepseek_model: str = "deepseek-vision:7b"
    ollama_llm_model: str = "ollama3.1:8b"
    ollama_timeout_seconds: int = 120
    ollama_temperature: float = 0.7
    
    # Pipeline
    pipeline_batch_size: int = 5
    pipeline_memory_threshold_gb: int = 14
    pipeline_retry_attempts: int = 3
    pipeline_dry_run: bool = True
    
    # PostgreSQL Database
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/auto_apply_pro"
    database_pool_size: int = 10
    database_max_overflow: int = 5
    database_pool_timeout_seconds: int = 30
    database_echo_sql: bool = False
    
    # Storage
    storage_archive_after_days: int = 30
    storage_retention_policy_enabled: bool = True
    
    # SMTP
    smtp_enabled: bool = False
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_rate_limit_seconds: int = 5
    
    # Backend
    backend_api_url: str = "http://localhost:8060"
    backend_sync_enabled: bool = True
    backend_sync_interval_seconds: int = 60
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "./logs/pipeline.log"
    log_format: str = "json"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
```

---

## Dependencies

### **Core Dependencies**

```txt
# Configuration & Data Validation
pydantic>=2.0
pydantic-settings>=2.0
python-dotenv>=1.0

# Async & HTTP
aiohttp>=3.8
asyncio  # Built-in

# Image Processing (Stage 1)
Pillow>=9.0

# Document Parsing (Stage 2)
pypdf>=3.0
python-docx>=0.8

# Database (Stage 4) - PostgreSQL
asyncpg>=0.28  # Async PostgreSQL driver
sqlalchemy>=2.0  # ORM & query building (optional, for migrations)
alembic>=1.12  # Database migrations

# Email Validation & Sending (Stage 4)
email-validator>=1.3
python-email-validator>=1.3

# Monitoring & Logging
psutil>=5.9
loguru>=0.7

# Testing
pytest>=7.0
pytest-asyncio>=0.21
pytest-cov>=4.0

# Development
black>=23.0  # Code formatting
mypy>=1.0    # Type checking
pylint>=2.17  # Linting
```

### **Installation**

```bash
# Using pip
pip install -r requirements.txt

# Using Poetry (recommended)
poetry install
poetry run pytest  # Run tests
poetry run python -m src.pipeline  # Run pipeline

# Database setup
poetry run alembic upgrade head  # Apply migrations
```

---

## PostgreSQL Implementation Details

### **Database Schema**

The pipeline creates/uses the following tables in PostgreSQL:

```sql
-- Main emails table
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- pending, sent, failed, draft
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    candidate_name VARCHAR(255) NOT NULL,
    
    -- Tracking fields
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Source tracking
    jd_source VARCHAR(255),
    candidate_source VARCHAR(255),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',  -- Store additional data as JSON
    
    -- Indexes
    CONSTRAINT emails_status_check CHECK (status IN ('pending', 'sent', 'failed', 'draft'))
);

-- Create indexes for common queries
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_recipient_email ON emails(recipient_email);
CREATE INDEX idx_emails_created_at ON emails(created_at);
CREATE INDEX idx_emails_sent_at ON emails(sent_at);
CREATE INDEX idx_emails_candidate_name ON emails(candidate_name);
CREATE INDEX idx_emails_company ON emails(company);

-- Archive table for old emails (optional)
CREATE TABLE IF NOT EXISTS emails_archive (
    LIKE emails INCLUDING ALL
) INHERITS (emails);

-- Audit log table (optional)
CREATE TABLE IF NOT EXISTS email_audit_log (
    id SERIAL PRIMARY KEY,
    email_id INTEGER NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,  -- created, sent, failed, retry
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_audit_log_email_id ON email_audit_log(email_id);
```

### **Connection Management with asyncpg**

```python
# src/stage4_storage/postgres_manager.py

import asyncpg
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class PostgresManager:
    def __init__(self, config):
        self.config = config
        self.pool: Optional[asyncpg.Pool] = None
    
    async def initialize(self):
        """Create connection pool at startup"""
        try:
            # Parse PostgreSQL URL: postgresql+asyncpg://user:pass@host:port/db
            db_url = self.config.database_url.replace("postgresql+asyncpg://", "")
            
            self.pool = await asyncpg.create_pool(
                db_url,
                min_size=self.config.database_pool_size // 2,
                max_size=self.config.database_pool_size,
                max_queries=50000,
                max_cached_statement_lifetime=300,
                max_cacheable_statement_size=15000,
                command_timeout=self.config.database_pool_timeout_seconds,
                server_settings={'jit': 'off'},  # Disable JIT for faster execution
            )
            logger.info(f"PostgreSQL connection pool initialized: {self.config.database_pool_size} connections")
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL pool: {e}")
            raise
    
    async def close(self):
        """Close connection pool at shutdown"""
        if self.pool:
            await self.pool.close()
            logger.info("PostgreSQL connection pool closed")
    
    @asynccontextmanager
    async def get_connection(self):
        """Context manager for getting a connection from pool"""
        if not self.pool:
            raise RuntimeError("Pool not initialized. Call initialize() first.")
        
        conn = await self.pool.acquire()
        try:
            yield conn
        finally:
            await self.pool.release(conn)
    
    async def save_email(self, conn: asyncpg.Connection, email: 'StoredEmail') -> 'StoredEmail':
        """Save email to database"""
        query = """
        INSERT INTO emails (
            recipient_email, recipient_name, subject, body, 
            status, job_title, company, candidate_name,
            jd_source, candidate_source, generated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, created_at, updated_at
        """
        
        row = await conn.fetchrow(
            query,
            email.recipient_email,
            email.recipient_name,
            email.subject,
            email.body,
            email.status or 'pending',
            email.job_title,
            email.company,
            email.candidate_name,
            email.jd_source,
            email.candidate_source,
            email.generated_at,
        )
        
        email.id = row['id']
        logger.info(f"Email saved with ID {email.id}")
        return email
    
    async def get_email(self, conn: asyncpg.Connection, email_id: int) -> Optional['StoredEmail']:
        """Retrieve email by ID"""
        query = "SELECT * FROM emails WHERE id = $1"
        row = await conn.fetchrow(query, email_id)
        
        if row:
            return StoredEmail(**dict(row))
        return None
    
    async def list_pending(self, conn: asyncpg.Connection, limit: int = 100) -> List['StoredEmail']:
        """Get pending emails"""
        query = "SELECT * FROM emails WHERE status = 'pending' ORDER BY created_at LIMIT $1"
        rows = await conn.fetch(query, limit)
        return [StoredEmail(**dict(row)) for row in rows]
    
    async def mark_sent(self, conn: asyncpg.Connection, email_id: int) -> bool:
        """Mark email as sent"""
        query = """
        UPDATE emails 
        SET status = 'sent', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
        """
        result = await conn.fetchval(query, email_id)
        return result is not None
    
    async def mark_failed(self, conn: asyncpg.Connection, email_id: int, error_msg: str) -> bool:
        """Mark email as failed with error message"""
        query = """
        UPDATE emails 
        SET status = 'failed', error_message = $2, retry_count = retry_count + 1, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
        """
        result = await conn.fetchval(query, email_id, error_msg)
        return result is not None
    
    async def run_migrations(self):
        """Run Alembic migrations"""
        import subprocess
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            logger.error(f"Migration failed: {result.stderr}")
            raise RuntimeError(f"Database migration failed: {result.stderr}")
        logger.info("Database migrations applied successfully")
```

### **Alembic Migration Setup**

```bash
# Initialize Alembic in the project
alembic init alembic

# Create initial migration for email schema
alembic revision --autogenerate -m "Create emails table"

# View migrations
alembic history

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

**Sample migration file** (`alembic/versions/001_create_emails_table.py`):

```python
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'emails',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recipient_email', sa.String(255), nullable=False),
        sa.Column('recipient_name', sa.String(255), nullable=True),
        sa.Column('subject', sa.Text(), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='pending'),
        sa.Column('job_title', sa.String(255), nullable=False),
        sa.Column('company', sa.String(255), nullable=False),
        sa.Column('candidate_name', sa.String(255), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('jd_source', sa.String(255), nullable=True),
        sa.Column('candidate_source', sa.String(255), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.PrimaryKeyConstraint('id'),
    )
    
    # Create indexes
    op.create_index('idx_emails_status', 'emails', ['status'])
    op.create_index('idx_emails_recipient_email', 'emails', ['recipient_email'])
    op.create_index('idx_emails_created_at', 'emails', ['created_at'])
    op.create_index('idx_emails_candidate_name', 'emails', ['candidate_name'])
    op.create_index('idx_emails_company', 'emails', ['company'])

def downgrade():
    op.drop_table('emails')
```

### **Connection Pool Best Practices**

| Practice | Benefit |
|----------|---------|
| **Use asyncpg** (not psycopg2) | 2-3x faster, native async support |
| **Connection pooling** (asyncpg.Pool) | Reuse connections, reduce overhead |
| **Prepared statements** | Automatic caching by asyncpg |
| **JSONB for metadata** | Flexible storage, queryable fields |
| **Indexes on common queries** | Fast lookups on status, email, company |
| **Audit logging table** | Track email state changes |
| **Partitioning by date** (optional) | Manage large tables (1M+ rows) |
| **Connection timeouts** | Prevent hung connections |

### **Pipeline Startup/Shutdown**

```python
# src/pipeline.py

class Pipeline:
    async def __aenter__(self):
        """Startup: initialize connections"""
        await self.db_manager.initialize()
        await self.db_manager.run_migrations()
        logger.info("Pipeline initialized")
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Shutdown: close connections"""
        await self.db_manager.close()
        logger.info("Pipeline shutdown")

# Usage
async def main():
    config = Settings()
    async with Pipeline(config) as pipeline:
        await pipeline.run(
            jd_image=Path("sample_jd.png"),
            resume_file=Path("sample_resume.pdf")
        )
```

---

## Key Metrics & Success Criteria

| Metric | Target | Notes |
|--------|--------|-------|
| **JD Extraction Accuracy** | >90% | Correct title, company, skills |
| **Resume Parsing Accuracy** | >85% | Extracts name, email, skills |
| **Email Generation Quality** | Manual review | Should be personalized, professional |
| **Pipeline Latency (per email)** | <60 seconds | Deepseek + Ollama inference |
| **Memory Usage Peak** | <14GB | Leave 2GB headroom on 16GB Mac |
| **Email Generation Cost** | $0 | All local, no API calls |
| **Storage Efficiency** | <10MB per email | JSON + metadata |

---

## Next Steps

1. **Create project scaffold** (folder structure, config, dependencies)
2. **Implement Phase 1 & 2**: Core infrastructure + JD extraction
3. **Test with real data** (LinkedIn, Naukari screenshots)
4. **Expand to Stages 2-4** (resume parsing, email gen, storage)
5. **Integrate with Spring Backend** (sync generated emails)
6. **Deploy & monitor** (rate limiting, error tracking, logs)

---

## References & Resources

- **Ollama Docs**: https://github.com/ollama/ollama
- **Deepseek Vision**: Vision-capable model for OCR
- **Ollama 3.1:8b**: Instruction-tuned model for parsing & generation
- **Pydantic**: https://docs.pydantic.dev/
- **Asyncio**: https://docs.python.org/3/library/asyncio.html
- **SQLite**: https://www.sqlite.org/docs.html

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-22  
**Author**: Auto Apply Pro Team
