import json
import logging
from datetime import datetime
import aiohttp
from src.config import Settings
from src.stage1_jd_extraction.schemas import JobDescription

logger = logging.getLogger(__name__)

class JDParser:
    def __init__(self, config: Settings, session: aiohttp.ClientSession):
        self.config = config
        self.session = session

    async def parse(self, ocr_text: str, source_filename: str) -> JobDescription:
        """Uses Ollama instruction model to extract structured data from raw OCR text and validates using Pydantic."""
        prompt = f"""
        Extract the following job description details from the OCR text into a JSON object matching this schema:
        {{
            "job_title": "string (Required)",
            "company": "string (Required)",
            "skills": ["string"] (Required, list of skills),
            "salary": {{
                "min": int or null,
                "max": int or null,
                "currency": "string"
            }} or null,
            "recruiter_emails": ["string"] (Search for all email patterns matching [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{{2,}}),
            "experience_required": "string" or null,
            "location": "string" or null,
            "job_type": "string" or null (e.g. Full-time, Contract, Part-time, Internship),
            "description": "string (Required, a clean, readable, professional summary of the job description. Do not include coordinates, HTML tags, or email/contact instructions)"
        }}

        Ensure all keys are present. If a field is missing, assign it null.
        Only output the raw JSON object. Do not wrap it in markdown or formatting blocks.

        OCR text:
        {ocr_text}
        """

        payload = {
            "model": self.config.ollama_llm_model,
            "prompt": prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": self.config.ollama_temperature
            }
        }

        logger.info(f"Sending OCR text to Ollama LLM model {self.config.ollama_llm_model} for parsing")
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
                
                # Populate metadata fields required by the JobDescription model
                parsed_json["raw_ocr_text"] = ocr_text
                parsed_json["source_filename"] = source_filename
                parsed_json["extracted_at"] = datetime.utcnow().isoformat()
                
                # Extract and deduplicate all emails from OCR text as fallback or additional validation
                import re
                email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
                found_emails = re.findall(email_pattern, ocr_text)
                unique_emails = list(dict.fromkeys(found_emails))
                
                if not parsed_json.get("recruiter_emails"):
                    parsed_json["recruiter_emails"] = unique_emails

                # Enforce fallback defaults if required Pydantic fields are missing/null
                if not parsed_json.get("job_title"):
                    parsed_json["job_title"] = "Unknown Job Title"
                if not parsed_json.get("company"):
                    parsed_json["company"] = "Unknown Company"
                if not isinstance(parsed_json.get("skills"), list):
                    parsed_json["skills"] = []
                if not parsed_json.get("description"):
                    parsed_json["description"] = ocr_text or "No description provided."

                return JobDescription(**parsed_json)
        except json.JSONDecodeError as jde:
            logger.error(f"Failed to decode JSON response from Ollama: {jde}. Raw text: {response_text}")
            raise RuntimeError(f"Ollama returned invalid JSON: {jde}")
        except Exception as e:
            logger.error(f"Error calling Ollama instruction API for JD parsing: {e}")
            raise RuntimeError(f"Ollama JD parsing call failed: {e}")
