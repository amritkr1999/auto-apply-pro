import json
import logging
from datetime import datetime
from typing import Optional
import aiohttp
from src.config import Settings
from src.stage1_jd_extraction.schemas import JobDescription
from src.stage2_resume_parsing.schemas import Candidate
from src.stage3_email_gen.schemas import Email
from src.stage3_email_gen.prompt_builder import PromptBuilder

logger = logging.getLogger(__name__)

email_response_schema = {
    "type": "OBJECT",
    "properties": {
        "subject": {"type": "STRING"},
        "body": {"type": "STRING"}
    },
    "required": ["subject", "body"]
}

def clean_json_text(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

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
        
        # ==========================================
        # LEGACY LOCAL INFERENCE (Preserved)
        # ==========================================
        # logger.info(f"Sending messages to LLM model {self.config.ollama_llm_model} for email generation")
        # try:
        #     from src.llm_client import call_llm
        #     response_text = await call_llm(
        #         config=self.config,
        #         session=self.session,
        #         model=self.config.ollama_llm_model,
        #         purpose="email_generation",
        #         prompt=user_prompt,
        #         system_prompt=system_prompt,
        #         json_format=True,
        #         temperature=self.config.ollama_temperature
        #     )
        #     parsed_json = json.loads(response_text)
        #     
        #     email = Email(
        #         recipient_email=jd.recruiter_emails[0] if (getattr(jd, "recruiter_emails", None) and len(jd.recruiter_emails) > 0) else "recruiter@example.com",
        #         recipient_name=None,
        #         subject=parsed_json.get("subject", f"Application for {jd.job_title} at {jd.company}"),
        #         body=parsed_json.get("body", ""),
        #         generated_at=datetime.utcnow().isoformat(),
        #         jd_source=getattr(jd, "source_filename", "api_request"),
        #         candidate_source=getattr(candidate, "source_filename", "api_request"),
        #         job_title=jd.job_title,
        #         company=jd.company
        #     )
        #     return email
        # except json.JSONDecodeError as jde:
        #     logger.error(f"Failed to decode JSON email response from Ollama: {jde}. Raw text: {response_text}")
        #     raise RuntimeError(f"Ollama returned invalid JSON for email: {jde}")
        # except Exception as e:
        #     logger.error(f"Error calling Ollama instruction API for email generation: {e}")
        #     raise RuntimeError(f"Ollama email generation call failed: {e}")
        # ==========================================

        if self.config.use_local_model:
            logger.info(f"Sending messages to LLM model {self.config.ollama_llm_model} for email generation (Local Model)")
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
                cleaned_text = clean_json_text(response_text)
                parsed_json = json.loads(cleaned_text)
            except json.JSONDecodeError as jde:
                logger.error(f"Failed to decode JSON email response from Ollama: {jde}. Raw text: {response_text}")
                raise RuntimeError(f"Ollama returned invalid JSON for email: {jde}")
            except Exception as e:
                logger.error(f"Error calling Ollama instruction API for email generation: {e}")
                raise RuntimeError(f"Ollama email generation call failed: {e}")
        else:
            logger.info("Routing email generation request to Google Gemini API")
            try:
                import os
                import google.generativeai as genai
                
                api_key = os.environ.get("GEMINI_API_KEY") or self.config.gemini_api_key
                if not api_key:
                    raise RuntimeError("GEMINI_API_KEY environment variable is not set")
                genai.configure(api_key=api_key)
                
                model_name = self.config.ollama_llm_model
                if "gemini-1.5-flash" in model_name.lower():
                    model_name = "gemini-3.5-flash"
                elif "gemini-1.5-pro" in model_name.lower():
                    model_name = "gemini-2.5-pro"
                elif "gemini" not in model_name.lower():
                    model_name = "gemini-3.5-flash"
                
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_prompt,
                    generation_config={
                        "response_mime_type": "application/json",
                        "response_schema": email_response_schema,
                        "temperature": self.config.ollama_temperature
                    }
                )
                
                response = await model.generate_content_async(user_prompt)
                response_text = response.text.strip()
                cleaned_text = clean_json_text(response_text)
                parsed_json = json.loads(cleaned_text)
            except json.JSONDecodeError as jde:
                logger.error(f"Failed to decode JSON response from Gemini: {jde}. Raw text: {response_text}")
                raise RuntimeError(f"Gemini returned invalid JSON for email: {jde}")
            except Exception as e:
                logger.error(f"Error calling Google Gemini API for email generation: {e}")
                raise RuntimeError(f"Gemini email generation call failed: {e}")

        try:
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
        except Exception as e:
            logger.error(f"Error building Email model from parsed json: {e}")
            raise RuntimeError(f"Email model instantiation failed: {e}")

    async def generate_hook(self, job_description: str, resume_snippet: str, model_name: str, persona: Optional[str] = None) -> str:
        """Sends a hook generation prompt to the LLM (Ollama or other configured provider) with the specific model."""
        persona_instruction = ""
        if persona:
            p_lower = persona.lower()
            if "lawyer" in p_lower or "legal" in p_lower or "document_verification" in p_lower:
                persona_instruction = "Tone/Persona: Prioritize regulatory precision, formal tone, compliance/analytical accuracy, and standard legal communication terminology. Avoid informal or overly enthusiastic phrasing."
            elif "manager" in p_lower or "leader" in p_lower or "consultant" in p_lower or "knowledge_worker" in p_lower:
                persona_instruction = "Tone/Persona: Focus heavily on leadership metrics, key performance indicators (KPIs), team orchestration, business outcomes, and strategic growth impact."
            elif "developer" in p_lower or "engineer" in p_lower or "programmer" in p_lower:
                persona_instruction = "Tone/Persona: Focus on software architectures, technical stacks, coding practices, and engineering problem-solving."

        prompt = f"""
You are a highly skilled professional outreach assistant. Your task is to write a highly tailored, compelling 1-2 sentence opening hook for a job application email.

{persona_instruction}

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
        
        # ==========================================
        # LEGACY LOCAL INFERENCE (Preserved)
        # ==========================================
        # logger.info(f"Sending prompt to LLM model {model_name} for hook generation")
        # try:
        #     from src.llm_client import call_llm
        #     response_text = await call_llm(
        #         config=self.config,
        #         session=self.session,
        #         model=model_name,
        #         purpose="hook_generation",
        #         prompt=prompt,
        #         temperature=self.config.ollama_temperature
        #     )
        #     # Clean any markdown code fences if LLM accidentally outputs them
        #     if response_text.startswith("```"):
        #         response_text = response_text.replace("```", "").strip()
        #     return response_text
        # except Exception as e:
        #     logger.error(f"Error calling LLM for hook generation: {e}")
        #     raise RuntimeError(f"LLM hook generation call failed: {e}")
        # ==========================================

        if self.config.use_local_model:
            logger.info(f"Sending prompt to LLM model {model_name} for hook generation (Local Model)")
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
                if response_text.startswith("```"):
                    response_text = response_text.replace("```", "").strip()
                return response_text
            except Exception as e:
                logger.error(f"Error calling LLM for hook generation: {e}")
                raise RuntimeError(f"LLM hook generation call failed: {e}")
        else:
            logger.info("Routing hook generation request to Google Gemini API")
            try:
                import os
                import google.generativeai as genai
                
                api_key = os.environ.get("GEMINI_API_KEY") or self.config.gemini_api_key
                if not api_key:
                    raise RuntimeError("GEMINI_API_KEY environment variable is not set")
                genai.configure(api_key=api_key)
                
                target_model = model_name
                if "gemini-1.5-flash" in target_model.lower():
                    target_model = "gemini-3.5-flash"
                elif "gemini-1.5-pro" in target_model.lower():
                    target_model = "gemini-2.5-pro"
                elif "gemini" not in target_model.lower():
                    target_model = "gemini-3.5-flash"
                
                model = genai.GenerativeModel(
                    model_name=target_model,
                    generation_config={
                        "temperature": self.config.ollama_temperature
                    }
                )
                
                response = await model.generate_content_async(prompt)
                response_text = response.text.strip()
                if response_text.startswith("```"):
                    response_text = response_text.replace("```", "").strip()
                return response_text
            except Exception as e:
                logger.error(f"Error calling Google Gemini API for hook generation: {e}")
                raise RuntimeError(f"Gemini hook generation call failed: {e}")
