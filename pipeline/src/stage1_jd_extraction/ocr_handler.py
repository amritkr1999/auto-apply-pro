import base64
import logging
from pathlib import Path
import aiohttp
from src.config import Settings

logger = logging.getLogger(__name__)

class OCRHandler:
    def __init__(self, config: Settings, session: aiohttp.ClientSession):
        self.config = config
        self.session = session

    async def extract_ocr(self, image_path: Path) -> str:
        """Loads a local image, encodes it to base64, and sends it to Ollama Deepseek Vision model for OCR."""
        if not image_path.exists():
            raise FileNotFoundError(f"Job description image not found: {image_path}")

        try:
            with open(image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        except Exception as e:
            logger.error(f"Failed to read/encode image {image_path}: {e}")
            raise RuntimeError(f"Failed to read image: {e}")

        if "deepseek-ocr" in self.config.ollama_deepseek_model.lower():
            prompt = "Free OCR."
        else:
            prompt = (
                "Perform OCR on this image. Extract all text content verbatim from this job description. "
                "Do not add any preamble, comments, or summaries. Output only the extracted text."
            )

        payload = {
            "model": self.config.ollama_deepseek_model,
            "prompt": prompt,
            "images": [encoded_string],
            "stream": False,
            "options": {
                "temperature": 0.0  # Keep it deterministic for OCR
            }
        }

        logger.info(f"Sending JD image {image_path.name} to vision model: {self.config.ollama_deepseek_model}")
        try:
            from src.llm_client import call_llm
            ocr_text = await call_llm(
                config=self.config,
                session=self.session,
                model=self.config.ollama_deepseek_model,
                purpose="ocr_extraction",
                prompt=prompt,
                images=[encoded_string],
                temperature=0.0
            )
            if not ocr_text:
                logger.warning(f"Vision model returned empty OCR text for {image_path.name}")
            return ocr_text
        except Exception as e:
            logger.error(f"Error calling vision OCR API: {e}")
            raise RuntimeError(f"Vision OCR call failed: {e}")
