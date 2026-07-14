import json
import logging
from datetime import datetime
import aiohttp
from src.config import Settings
from src.stage2_resume_parsing.schemas import Candidate

logger = logging.getLogger(__name__)

resume_schema = {
    "type": "OBJECT",
    "properties": {
        "name": {"type": "STRING"},
        "email": {"type": "STRING"},
        "phone": {"type": "STRING"},
        "location": {"type": "STRING"},
        "skills": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "experience": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "title": {"type": "STRING"},
                    "company": {"type": "STRING"},
                    "duration": {"type": "STRING"},
                    "description": {"type": "STRING"}
                },
                "required": ["title", "company"]
            }
        },
        "education": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "degree": {"type": "STRING"},
                    "institution": {"type": "STRING"},
                    "graduation_year": {"type": "INTEGER"},
                    "field_of_study": {"type": "STRING"}
                },
                "required": ["degree", "institution"]
            }
        },
        "certifications": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "summary": {"type": "STRING"}
    },
    "required": ["name", "email", "skills"]
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

class ResumeParser:
    def __init__(self, config: Settings, session: aiohttp.ClientSession):
        self.config = config
        self.session = session

    async def parse(self, resume_text: str, source_filename: str) -> Candidate:
        """Uses Ollama model or Google Gemini API to extract structured candidate details from resume text."""
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

        if self.config.use_local_model:
            logger.info(f"Sending resume text to LLM model {self.config.ollama_llm_model} for parsing (Local Model)")
            try:
                from src.llm_client import call_llm
                response_text = await call_llm(
                    config=self.config,
                    session=self.session,
                    model=self.config.ollama_llm_model,
                    purpose="resume_parsing",
                    prompt=user_prompt,
                    system_prompt=system_prompt,
                    json_format=True,
                    temperature=self.config.ollama_temperature
                )
                cleaned_text = clean_json_text(response_text)
                parsed_json = json.loads(cleaned_text)
            except json.JSONDecodeError as jde:
                logger.error(f"Failed to decode JSON response from Ollama: {jde}. Raw text: {response_text}")
                raise RuntimeError(f"Ollama returned invalid JSON: {jde}")
            except Exception as e:
                logger.error(f"Error calling Ollama instruction API for resume parsing: {e}")
                raise RuntimeError(f"Ollama resume parsing call failed: {e}")
        else:
            logger.info("Routing resume parsing request to Google Gemini API")
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
                        "response_schema": resume_schema,
                        "temperature": self.config.ollama_temperature
                    }
                )
                
                response = await model.generate_content_async(user_prompt)
                response_text = response.text.strip()
                cleaned_text = clean_json_text(response_text)
                parsed_json = json.loads(cleaned_text)
            except json.JSONDecodeError as jde:
                logger.error(f"Failed to decode JSON response from Gemini: {jde}. Raw text: {response_text}")
                raise RuntimeError(f"Gemini returned invalid JSON: {jde}")
            except Exception as e:
                logger.error(f"Error calling Google Gemini API for resume parsing: {e}")
                raise RuntimeError(f"Gemini resume parsing call failed: {e}")

        try:
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
        except Exception as e:
            logger.error(f"Error building Candidate model from parsed json: {e}")
            raise RuntimeError(f"Candidate model instantiation failed: {e}")
