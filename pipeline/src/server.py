import os
import tempfile
import logging
from pathlib import Path
from typing import List, Optional
import aiohttp
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.config import Settings
from src.stage1_jd_extraction.ocr_handler import OCRHandler
from src.stage1_jd_extraction.jd_parser import JDParser
from src.stage2_resume_parsing.file_loader import FileLoader
from src.stage2_resume_parsing.resume_parser import ResumeParser
from src.stage3_email_gen.email_generator import EmailGenerator

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pipeline_server")

app = FastAPI(title="Auto Apply Pro AI Pipeline Service")

# Enable CORS for convenience
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

config = Settings()

# Globals for reusable instances
session = None
ocr_handler = None
jd_parser = None
file_loader = None
resume_parser = None
email_generator = None

@app.on_event("startup")
async def startup_event():
    global session, ocr_handler, jd_parser, file_loader, resume_parser, email_generator
    logger.info("Initializing pipeline components...")
    session = aiohttp.ClientSession()
    ocr_handler = OCRHandler(config, session)
    jd_parser = JDParser(config, session)
    file_loader = FileLoader(config)
    resume_parser = ResumeParser(config, session)
    email_generator = EmailGenerator(config, session)
    logger.info("Pipeline components initialized successfully.")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down session...")
    if session:
        await session.close()
    logger.info("Session shut down successfully.")

@app.post("/extract-job-details")
async def extract_job_details(file: UploadFile = File(...)):
    logger.info(f"Received request to extract job details from file: {file.filename}")
    suffix = Path(file.filename).suffix if file.filename else ".png"
    if suffix.lower() not in [".png", ".jpg", ".jpeg", ".webp"]:
        suffix = ".png"
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)
    
    try:
        ocr_text = await ocr_handler.extract_ocr(tmp_path)
        job_desc = await jd_parser.parse(ocr_text, file.filename or "screenshot.png")
        
        # Format salary to string
        salary_str = ""
        if job_desc.salary:
            min_val = job_desc.salary.min
            max_val = job_desc.salary.max
            curr = job_desc.salary.currency
            if min_val and max_val:
                salary_str = f"{min_val} - {max_val} {curr}"
            elif min_val:
                salary_str = f"{min_val}+ {curr}"
            elif max_val:
                salary_str = f"Up to {max_val} {curr}"
        
        # Format requirements
        req_list = []
        if job_desc.skills:
            req_list.append(f"Required Skills: {', '.join(job_desc.skills)}")
        if job_desc.experience_required:
            req_list.append(f"Experience: {job_desc.experience_required}")
        requirements_str = "\n".join(req_list) if req_list else "Not specified"

        # Construct the JobDetailsDto response expected by Spring Boot
        response_data = {
            "title": job_desc.job_title,
            "company": job_desc.company,
            "location": job_desc.location or "Not specified",
            "description": job_desc.description or job_desc.raw_ocr_text,
            "requirements": requirements_str,
            "salary": salary_str,
            "sourceUrl": job_desc.source_filename,
            "skills": job_desc.skills,
            "hr_email": job_desc.recruiter_email
        }
        return response_data
    except Exception as e:
        logger.error(f"Error extracting job details: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if tmp_path.exists():
                os.unlink(tmp_path)
        except Exception as cleanup_err:
            logger.warning(f"Failed to cleanup temporary file {tmp_path}: {cleanup_err}")


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    logger.info(f"Received request to parse resume file: {file.filename}")
    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)
        
    try:
        resume_text = file_loader.load(tmp_path)
        candidate = await resume_parser.parse(resume_text, file.filename)
        return candidate
    except Exception as e:
        logger.error(f"Error parsing resume: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if tmp_path.exists():
                os.unlink(tmp_path)
        except Exception as cleanup_err:
            logger.warning(f"Failed to cleanup temporary file {tmp_path}: {cleanup_err}")


class EmailJobDetails(BaseModel):
    job_title: str
    company: str
    skills: List[str] = []
    location: Optional[str] = None
    job_type: Optional[str] = None
    recruiter_email: Optional[str] = None

class EmailExperienceEntry(BaseModel):
    title: str
    company: str
    duration: Optional[str] = None
    description: Optional[str] = None

class EmailCandidateProfile(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    skills: List[str] = []
    summary: Optional[str] = None
    experience: List[EmailExperienceEntry] = []

class EmailGenerationRequest(BaseModel):
    job_details: EmailJobDetails
    candidate: EmailCandidateProfile

@app.post("/generate-email")
async def generate_email(req: EmailGenerationRequest):
    logger.info(f"Received request to generate email for job: {req.job_details.job_title} at {req.job_details.company}")
    try:
        email = await email_generator.generate(req.job_details, req.candidate)
        return {
            "subject": email.subject,
            "body": email.body,
            "recipientEmail": email.recipient_email
        }
    except Exception as e:
        logger.error(f"Error generating outreach email: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


class JobParseRequest(BaseModel):
    url: str

@app.post("/parse-job-url")
async def parse_job_url(req: JobParseRequest):
    logger.info(f"Received request to parse job URL: {req.url}")
    try:
        # Fetch the URL content
        async with session.get(req.url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=400, detail=f"Failed to fetch URL: status {resp.status}")
            html_content = await resp.text()

        # Simple HTML tag stripper to get clean text for LLM
        import re
        # Remove scripts, styles
        clean_html = re.sub(r'<(script|style).*?>.*?</\1>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        # Strip HTML tags
        clean_text = re.sub(r'<[^>]*>', ' ', clean_html)
        # Normalize whitespace
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        # Cap the clean text length to prevent context window overflow
        clean_text = clean_text[:8000]

        # Call the existing JDParser to parse the text
        job_desc = await jd_parser.parse(clean_text, req.url)

        # Return formatted response
        return {
            "title": job_desc.job_title,
            "company": job_desc.company,
            "skills": job_desc.skills,
            "experience_required": job_desc.experience_required or "Not specified",
            "description": job_desc.description or clean_text[:2000]
        }
    except Exception as e:
        logger.error(f"Error parsing job URL {req.url}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.server:app", host="0.0.0.0", port=8000, reload=True)

