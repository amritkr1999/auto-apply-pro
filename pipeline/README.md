# Auto Apply Pro - Local Outreach Email Pipeline

This subproject implements an agentic, multi-stage local pipeline designed to ingest job description screenshots, extract job details using vision/text models, parse candidate resumes, and generate highly tailored recruiter outreach email drafts.

## Features

1. **Stage 1: Job Description OCR & Extraction**
   - Direct vision-based OCR on JD screenshots using `deepseek-vision` via Ollama.
   - Structuring of extracted text using instruction LLM (`ollama3.1:8b`) to populate job details (title, company, skills, email).

2. **Stage 2: Resume Loading & Parsing**
   - Multi-format loader (supports PDF, DOCX, MD, TXT).
   - Structured parsing using local LLM into candidate Pydantic models.

3. **Stage 3: Email Personalization**
   - Dynamic prompt generation aligning candidate expertise with job requirements.
   - Enforced structured JSON output of tailored Subject and Body outreach copy.

4. **Stage 4: Storage & Delivery**
   - Persistent schema-driven logging in PostgreSQL database using connection pooling via `asyncpg`.
   - Automatic execution of database migrations via Alembic.
   - Config-gated SMTP outbound email sender.
   - Spring Boot REST API integration to sync generated draft emails with the main project database.

## Installation & Setup

1. **Install Poetry**
   Poetry is used to manage dependencies inside a local virtual environment.
   ```bash
   pip install poetry
   ```

2. **Install Dependencies**
   Run the following from the `pipeline` directory:
   ```bash
   poetry install
   ```

3. **Environment Setup**
   Copy the `.env.example` file and configure it:
   ```bash
   cp .env.example .env
   ```
   Specify your local database credentials, Ollama API endpoint, and Spring Boot API endpoints in the `.env` file.

## Database Setup

Before running the pipeline, make sure your PostgreSQL database is running and run the Alembic migrations:
```bash
poetry run alembic upgrade head
```

## Running the Pipeline

You can run the end-to-end pipeline orchestrator programmatically:
```python
from pathlib import Path
from src.config import Settings
from src.pipeline import Pipeline

async def main():
    config = Settings()
    async with Pipeline(config) as pipeline:
        result = await pipeline.run(
            jd_image=Path("path/to/jd_screenshot.png"),
            resume_file=Path("path/to/resume.pdf"),
            dry_run=True  # Disable SMTP dispatch
        )
        print(f"Pipeline Result Status: {result.status}")
        print(f"Stored Email ID: {result.stored_id}")
```
