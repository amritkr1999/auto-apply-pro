import os
import tempfile
import logging
from pathlib import Path
import aiohttp
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.config import Settings
from src.stage1_jd_extraction.ocr_handler import OCRHandler
from src.stage1_jd_extraction.jd_parser import JDParser
from src.stage2_resume_parsing.file_loader import FileLoader
from src.stage2_resume_parsing.resume_parser import ResumeParser

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

@app.on_event("startup")
async def startup_event():
    global session, ocr_handler, jd_parser, file_loader, resume_parser
    logger.info("Initializing pipeline components...")
    session = aiohttp.ClientSession()
    ocr_handler = OCRHandler(config, session)
    jd_parser = JDParser(config, session)
    file_loader = FileLoader(config)
    resume_parser = ResumeParser(config, session)
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
    suffix = Path(file.filename).suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = Path(tmp.name)
    
    try:
        ocr_text = await ocr_handler.extract_ocr(tmp_path)
        job_details = await jd_parser.parse(ocr_text, file.filename)
        return job_details
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
