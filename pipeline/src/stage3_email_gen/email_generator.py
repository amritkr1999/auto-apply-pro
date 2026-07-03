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
        messages = self.prompt_builder.build_messages(jd, candidate)
        
        system_prompt = messages[0]["content"]
        user_prompt = messages[1]["content"]
        
        logger.info(f"Sending messages to LLM model {self.config.ollama_llm_model} for email generation")
        try:
            from src.llm_client import call_llm
            response_text = await call_llm(
                config=self.config,
                session=self.session,
                model=self.config.ollama_llm_model,
                purpose="email_generation",
                prompt=user_prompt,
                system_prompt=system_prompt,
                json_format=True,
                temperature=self.config.ollama_temperature
            )
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

    async def generate_hook(self, job_description: str, resume_snippet: str, model_name: str) -> str:
        """Sends a hook generation prompt to the LLM (Ollama or other configured provider) with the specific model."""
        prompt = f"""
You are a highly skilled professional outreach assistant. Your task is to write a highly tailored, compelling 1-2 sentence opening hook for a job application email.

Job Description:
{job_description}

Candidate Resume Snippet:
{resume_snippet}

Instructions:
1. Write ONLY the opening hook (1-2 sentences). Do NOT include any greetings (e.g., "Hi Hiring Manager"), subject lines, closings, or signatures.
2. The hook must immediately connect a strong skill or experience from the candidate's resume snippet directly to a key requirement/challenge in the job description to grab attention.
3. Be professional, direct, and customized. Avoid generic templates or buzzwords.
4. Output ONLY the hook text itself. Do not wrap in JSON, markdown code fences, or add explanatory text.
"""
        payload = {
            "model": model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": self.config.ollama_temperature
            }
        }
        
        logger.info(f"Sending prompt to LLM model {model_name} for hook generation")
        try:
            from src.llm_client import call_llm
            response_text = await call_llm(
                config=self.config,
                session=self.session,
                model=model_name,
                purpose="hook_generation",
                prompt=prompt,
                temperature=self.config.ollama_temperature
            )
            # Clean any markdown code fences if LLM accidentally outputs them
            if response_text.startswith("```"):
                response_text = response_text.replace("```", "").strip()
            return response_text
        except Exception as e:
            logger.error(f"Error calling LLM for hook generation: {e}")
            raise RuntimeError(f"LLM hook generation call failed: {e}")
