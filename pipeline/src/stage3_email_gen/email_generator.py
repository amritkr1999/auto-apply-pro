import json
import logging
from datetime import datetime
import aiohttp
from src.config import Settings
from src.stage1_jd_extraction.schemas import JobDescription
from src.stage2_resume_parsing.schemas import Candidate
from src.stage3_email_gen.schemas import Email
from src.stage3_email_gen.prompt_builder import PromptBuilder

logger = logging.getLogger(__name__)

class EmailGenerator:
    def __init__(self, config: Settings, session: aiohttp.ClientSession):
        self.config = config
        self.session = session
        self.prompt_builder = PromptBuilder(config)

    async def generate(self, jd: JobDescription, candidate: Candidate) -> Email:
        """Sends the constructed prompt to Ollama LLM to generate the outreach email."""
        prompt = self.prompt_builder.build(jd, candidate)
        
        payload = {
            "model": self.config.ollama_llm_model,
            "prompt": prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": self.config.ollama_temperature
            }
        }
        
        logger.info(f"Sending prompt to Ollama LLM model {self.config.ollama_llm_model} for email generation")
        try:
            async with self.session.post(
                f"{self.config.ollama_base_url}/api/generate",
                json=payload,
                timeout=self.config.ollama_timeout_seconds
            ) as resp:
                resp.raise_for_status()
                data = await resp.json()
                response_text = data.get("response", "{}").strip()
                
                parsed_json = json.loads(response_text)
                
                email = Email(
                    recipient_email=jd.recruiter_emails[0] if (getattr(jd, "recruiter_emails", None) and len(jd.recruiter_emails) > 0) else "recruiter@example.com",
                    recipient_name=None,  # LLM can enrich this or we leave it empty
                    subject=parsed_json.get("subject", f"Application for {jd.job_title} at {jd.company}"),
                    body=parsed_json.get("body", ""),
                    generated_at=datetime.utcnow().isoformat(),
                    jd_source=getattr(jd, "source_filename", "api_request"),
                    candidate_source=getattr(candidate, "source_filename", "api_request"),
                    job_title=jd.job_title,
                    company=jd.company
                )
                return email
        except json.JSONDecodeError as jde:
            logger.error(f"Failed to decode JSON email response from Ollama: {jde}. Raw text: {response_text}")
            raise RuntimeError(f"Ollama returned invalid JSON for email: {jde}")
        except Exception as e:
            logger.error(f"Error calling Ollama instruction API for email generation: {e}")
            raise RuntimeError(f"Ollama email generation call failed: {e}")
