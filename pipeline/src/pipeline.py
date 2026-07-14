import logging
from pathlib import Path
import aiohttp
from src.config import Settings
from src.stage1_jd_extraction.ocr_handler import OCRHandler
from src.stage1_jd_extraction.jd_parser import JDParser
from src.stage2_resume_parsing.file_loader import FileLoader
from src.stage2_resume_parsing.resume_parser import ResumeParser
from src.stage3_email_gen.email_generator import EmailGenerator
from src.stage4_storage.postgres_manager import PostgresManager
from src.stage4_storage.smtp_sender import SMTPSender
from src.stage4_storage.schemas import StoredEmail
from src.utils import check_memory_and_pause

logger = logging.getLogger(__name__)

class PipelineResult:
    def __init__(self, status: str, email, stored_id: int):
        self.status = status
        self.email = email
        self.stored_id = stored_id

class Pipeline:
    def __init__(self, config: Settings):
        self.config = config
        self.session = None
        self.ocr_handler = None
        self.jd_parser = None
        self.file_loader = FileLoader(config)
        self.resume_parser = None
        self.email_generator = None
        self.db_manager = PostgresManager(config)
        self.smtp_sender = SMTPSender(config)

    async def __aenter__(self):
        """Startup: initialize connections and connection pool."""
        self.session = aiohttp.ClientSession()
        self.ocr_handler = OCRHandler(self.config, session=self.session)
        self.jd_parser = JDParser(self.config, self.session)
        self.resume_parser = ResumeParser(self.config, self.session)
        self.email_generator = EmailGenerator(self.config, self.session)
        
        await self.db_manager.initialize()
        
        # Safe migration execution on startup
        try:
            await self.db_manager.run_migrations()
        except Exception as e:
            logger.warning(f"Alembic migrations failed to execute automatically: {e}. Ensure db exists and migrations are prepared.")
            
        logger.info("Pipeline initialized successfully.")
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Shutdown: close connections and connection pool."""
        if self.session:
            await self.session.close()
        await self.db_manager.close()
        logger.info("Pipeline shut down successfully.")

    async def run(self, jd_image: Path, resume_file: Path, dry_run: bool = False) -> PipelineResult:
        """Runs the complete Job outreach email pipeline end-to-end."""
        logger.info(f"Starting pipeline execution for JD image: {jd_image.name} and Resume: {resume_file.name}")
        
        # Check resource constraints before starting
        await check_memory_and_pause(self.config.pipeline_memory_threshold_gb)
        
        # Stage 1: Job Description OCR extraction
        jd_text = await self.ocr_handler.extract_ocr(jd_image)
        job_desc = await self.jd_parser.parse(jd_text, jd_image.name)
        
        # Stage 2: Resume parsing from file
        resume_text = self.file_loader.load(resume_file)
        candidate = await self.resume_parser.parse(resume_text, resume_file.name)
        
        # Stage 3: Email Generation
        email = await self.email_generator.generate(job_desc, candidate)
        
        # Stage 4: Database Storage
        stored_email = StoredEmail(
            recipient_email=email.recipient_email,
            recipient_name=email.recipient_name,
            subject=email.subject,
            body=email.body,
            status="pending",
            generated_at=email.generated_at,
            job_title=email.job_title,
            company=email.company,
            candidate_name=candidate.name,
            jd_source=email.jd_source,
            candidate_source=email.candidate_source
        )
        
        async with self.db_manager.get_connection() as conn:
            stored = await self.db_manager.save_email(conn, stored_email)
        
        # Optional: SMTP Email Dispatch
        should_send = (not dry_run) and (not self.config.pipeline_dry_run) and self.config.smtp_enabled
        if should_send:
            try:
                sent_success = await self.smtp_sender.send(stored)
                if sent_success:
                    async with self.db_manager.get_connection() as conn:
                        await self.db_manager.mark_sent(conn, stored.id)
            except Exception as e:
                logger.error(f"Failed to dispatch email for stored record {stored.id}: {e}")
                async with self.db_manager.get_connection() as conn:
                    await self.db_manager.mark_failed(conn, stored.id, str(e))
        else:
            logger.info("SMTP sending skipped (dry run mode enabled)")
            
        # Optional: Sync to Spring Boot Backend
        if self.config.backend_sync_enabled:
            await self.sync_to_backend(stored)
            
        return PipelineResult(status="success", email=email, stored_id=stored.id)

    async def sync_to_backend(self, stored_email: StoredEmail):
        """Pushes the generated email draft to the Spring Boot backend REST API."""
        payload = {
            "recipientEmail": stored_email.recipient_email,
            "subject": stored_email.subject,
            "body": stored_email.body,
            "jobTitle": stored_email.job_title,
            "company": stored_email.company,
            "candidateName": stored_email.candidate_name,
            "status": "draft"
        }
        
        headers = {}
        if self.config.backend_api_token:
            headers["Authorization"] = f"Bearer {self.config.backend_api_token}"
            
        logger.info(f"Syncing draft {stored_email.id} to Spring Backend: {self.config.backend_api_url}")
        try:
            # We can use our ClientSession to POST
            async with self.session.post(
                f"{self.config.backend_api_url}/api/drafts",
                json=payload,
                headers=headers
            ) as resp:
                if resp.status in [200, 201]:
                    logger.info(f"Email synced to backend: {stored_email.id}")
                else:
                    logger.error(f"Sync failed with status {resp.status}: {await resp.text()}")
        except Exception as e:
            logger.error(f"Exception during backend sync: {e}")
