import asyncio
import os
import sys
import logging
from pathlib import Path
import asyncpg
from src.config import Settings
from src.pipeline import Pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("run_pipeline_demo")

async def get_test_assets(db_url: str):
    # Strip sqlalchemy prefix
    if db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
        
    logger.info("Connecting to database to fetch sample screenshot and resume...")
    conn = await asyncpg.connect(db_url)
    try:
        # Fetch the latest screenshot
        screenshot_row = await conn.fetchrow(
            "SELECT file_name, lo_get(file_bytes) as content FROM screenshot_uploads WHERE file_bytes IS NOT NULL ORDER BY id DESC LIMIT 1"
        )
        if not screenshot_row:
            raise RuntimeError("No screenshot found in database.")
        
        # Fetch a resume
        resume_row = await conn.fetchrow(
            "SELECT resume_filename, lo_get(resume_bytes) as content FROM candidates WHERE resume_bytes IS NOT NULL ORDER BY id DESC LIMIT 1"
        )
        if not resume_row:
            raise RuntimeError("No resume found in database.")
            
        screenshot_path = Path("demo_screenshot.png")
        resume_path = Path(resume_row["resume_filename"] or "demo_resume.pdf")
        
        # Ensure correct extension for resume file loader to detect format
        if not resume_path.suffix:
            resume_path = resume_path.with_suffix(".pdf")
            
        # Write to temp files
        screenshot_path.write_bytes(screenshot_row["content"])
        resume_path.write_bytes(resume_row["content"])
        
        logger.info(f"Saved database assets locally: {screenshot_path} and {resume_path}")
        return screenshot_path, resume_path
    finally:
        await conn.close()

async def main():
    config = Settings()
    screenshot_path = None
    resume_path = None
    try:
        screenshot_path, resume_path = await get_test_assets(config.database_url)
        
        logger.info("Initializing and running the pipeline...")
        async with Pipeline(config) as pipeline:
            result = await pipeline.run(
                jd_image=screenshot_path,
                resume_file=resume_path,
                dry_run=True  # Disable SMTP dispatch
            )
            print("\n" + "="*50)
            print("PIPELINE EXECUTION SUCCESSFUL!")
            print(f"Status: {result.status}")
            print(f"Stored Email ID: {result.stored_id}")
            print(f"Recipient Name: {result.email.recipient_name}")
            print(f"Recipient Email: {result.email.recipient_email}")
            print(f"Subject: {result.email.subject}")
            print(f"Body Preview:\n{result.email.body[:300]}...")
            print("="*50 + "\n")
    except Exception as e:
        logger.exception("Error running the pipeline demo:")
        sys.exit(1)
    finally:
        # Cleanup
        if screenshot_path and screenshot_path.exists():
            screenshot_path.unlink()
        if resume_path and resume_path.exists():
            resume_path.unlink()

if __name__ == "__main__":
    asyncio.run(main())
