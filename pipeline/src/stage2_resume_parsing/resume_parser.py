import json
import logging
from datetime import datetime
import aiohttp
from src.config import Settings
from src.stage2_resume_parsing.schemas import Candidate

logger = logging.getLogger(__name__)

class ResumeParser:
    def __init__(self, config: Settings, session: aiohttp.ClientSession):
        self.config = config
        self.session = session

    async def parse(self, resume_text: str, source_filename: str) -> Candidate:
        """Uses Ollama model to extract structured candidate details from resume text."""
        system_prompt = """
        Extract the following candidate details from the resume text into a JSON object matching this schema:
        {
            "name": "string (Required)",
            "email": "string (Required)",
            "phone": "string" or null,
            "location": "string" or null,
            "skills": ["string"] (Required, list of skills),
            "experience": [
                {
                    "title": "string (Required)",
                    "company": "string (Required)",
                    "duration": "string" or null,
                    "description": "string" or null
                }
            ],
            "education": [
                {
                    "degree": "string (Required)",
                    "institution": "string (Required)",
                    "graduation_year": int or null,
                    "field_of_study": "string" or null
                }
            ],
            "certifications": ["string"],
            "summary": "string" or null
        }

        Ensure all keys are present. If a field is missing, assign it null.
        Only output the raw JSON object. Do not wrap it in markdown or formatting blocks.
        """

        user_prompt = f"Resume text:\n{resume_text}"

        payload = {
            "model": self.config.ollama_llm_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": self.config.ollama_temperature
            }
        }

        logger.info(f"Sending resume text to Ollama LLM model {self.config.ollama_llm_model} for parsing")
        try:
            async with self.session.post(
                f"{self.config.ollama_base_url}/api/chat",
                json=payload,
                timeout=self.config.ollama_timeout_seconds
            ) as resp:
                resp.raise_for_status()
                data = await resp.json()
                response_text = data.get("message", {}).get("content", "{}").strip()
                
                parsed_json = json.loads(response_text)
                
                # Populate metadata fields required by the Candidate model
                parsed_json["raw_text"] = resume_text
                parsed_json["source_filename"] = source_filename
                parsed_json["parsed_at"] = datetime.utcnow().isoformat()
                
                # Enforce fallback defaults if required Pydantic fields are missing/null
                if not parsed_json.get("name"):
                    parsed_json["name"] = "Unknown Candidate"
                if not parsed_json.get("email"):
                    parsed_json["email"] = "unknown@example.com"
                if not isinstance(parsed_json.get("skills"), list):
                    parsed_json["skills"] = []
                if not isinstance(parsed_json.get("experience"), list):
                    parsed_json["experience"] = []
                if not isinstance(parsed_json.get("education"), list):
                    parsed_json["education"] = []
                if not isinstance(parsed_json.get("certifications"), list):
                    parsed_json["certifications"] = []

                return Candidate(**parsed_json)
        except json.JSONDecodeError as jde:
            logger.error(f"Failed to decode JSON response from Ollama: {jde}. Raw text: {response_text}")
            raise RuntimeError(f"Ollama returned invalid JSON: {jde}")
        except Exception as e:
            logger.error(f"Error calling Ollama instruction API for resume parsing: {e}")
            raise RuntimeError(f"Ollama resume parsing call failed: {e}")
