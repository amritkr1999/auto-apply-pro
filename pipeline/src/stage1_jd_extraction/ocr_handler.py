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

        logger.info(f"Sending JD image {image_path.name} to Ollama Vision model: {self.config.ollama_deepseek_model}")
        try:
            async with self.session.post(
                f"{self.config.ollama_base_url}/api/generate",
                json=payload,
                timeout=self.config.ollama_timeout_seconds
            ) as resp:
                resp.raise_for_status()
                data = await resp.json()
                ocr_text = data.get("response", "").strip()
                if not ocr_text:
                    logger.warning(f"Ollama returned empty OCR text for {image_path.name}")
                return ocr_text
        except Exception as e:
            logger.error(f"Error calling Ollama vision API: {e}")
            raise RuntimeError(f"Ollama vision OCR call failed: {e}")
