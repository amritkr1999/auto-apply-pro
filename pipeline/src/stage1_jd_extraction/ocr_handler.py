import asyncio
import base64
import logging
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Optional

import aiohttp

from src.config import Settings

logger = logging.getLogger(__name__)


class OCRHandler:
    """Handles OCR extraction from job description images.

    Supports two providers controlled by ``config.ocr_provider``:
      - ``"pytesseract"`` (default) — local Tesseract OCR via pytesseract.
        Fast (~2-5 s), lightweight, no external service required.
      - ``"vision"`` — existing Ollama / Gemini vision model route.
        Requires either a running Ollama service or a Gemini API key.
    """

    def __init__(self, config: Settings, session: Optional[aiohttp.ClientSession] = None):
        self.config = config
        self.session = session  # Only needed for the "vision" fallback
        self._executor = ThreadPoolExecutor(max_workers=2)

    # ------------------------------------------------------------------
    # Public API (unchanged interface)
    # ------------------------------------------------------------------

    async def extract_ocr(self, image_path: Path) -> str:
        """Extract text from a job description image.

        Returns raw unstructured text suitable for downstream LLM parsing.
        """
        if not image_path.exists():
            raise FileNotFoundError(f"Job description image not found: {image_path}")

        provider = self.config.ocr_provider.lower()

        if provider == "pytesseract":
            return await self._extract_pytesseract(image_path)
        elif provider == "vision":
            return await self._extract_vision(image_path)
        else:
            raise ValueError(
                f"Unknown OCR provider '{provider}'. "
                "Supported values: 'pytesseract', 'vision'"
            )

    # ------------------------------------------------------------------
    # Pytesseract provider
    # ------------------------------------------------------------------

    async def _extract_pytesseract(self, image_path: Path) -> str:
        """Run pytesseract OCR in a thread-pool executor (non-blocking)."""
        logger.info(
            f"Running pytesseract OCR on {image_path.name} "
            f"(lang={self.config.pytesseract_language}, "
            f"preprocessing={self.config.ocr_image_preprocessing})"
        )
        loop = asyncio.get_event_loop()
        try:
            text = await asyncio.wait_for(
                loop.run_in_executor(
                    self._executor,
                    self._run_pytesseract_sync,
                    image_path,
                ),
                timeout=self.config.ocr_timeout_seconds,
            )
            if not text:
                logger.warning(f"Pytesseract returned empty text for {image_path.name}")
            return text
        except asyncio.TimeoutError:
            logger.error(
                f"Pytesseract OCR timed out after {self.config.ocr_timeout_seconds}s "
                f"for {image_path.name}"
            )
            raise RuntimeError(
                f"OCR timed out after {self.config.ocr_timeout_seconds}s"
            )
        except Exception as e:
            logger.error(f"Pytesseract OCR failed for {image_path.name}: {e}")
            raise RuntimeError(f"Pytesseract OCR failed: {e}")

    def _run_pytesseract_sync(self, image_path: Path) -> str:
        """Synchronous pytesseract extraction (called inside executor)."""
        import pytesseract
        from PIL import Image

        image = Image.open(image_path)

        if self.config.ocr_image_preprocessing:
            image = self._preprocess_image(image)

        text = pytesseract.image_to_string(
            image,
            lang=self.config.pytesseract_language,
        )
        return text.strip()

    @staticmethod
    def _preprocess_image(image):
        """Enhance image contrast and sharpness for better OCR accuracy.

        Job posting screenshots often have low contrast or slight blur.
        Preprocessing improves pytesseract accuracy by ~20-30 %.
        """
        from PIL import ImageEnhance

        # Convert to RGB (handles RGBA, grayscale, palette, etc.)
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Increase contrast — helps with low-contrast text on light backgrounds
        image = ImageEnhance.Contrast(image).enhance(1.5)

        # Increase sharpness — helps with slightly blurry screenshots
        image = ImageEnhance.Sharpness(image).enhance(2.0)

        return image

    # ------------------------------------------------------------------
    # Vision provider (existing Ollama / Gemini fallback)
    # ------------------------------------------------------------------

    async def _extract_vision(self, image_path: Path) -> str:
        """Original vision-model OCR via Ollama or Gemini (preserved as fallback)."""
        if self.session is None:
            raise RuntimeError(
                "Vision OCR provider requires an aiohttp ClientSession. "
                "Pass a session to OCRHandler or switch to ocr_provider='pytesseract'."
            )

        try:
            with open(image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        except Exception as e:
            logger.error(f"Failed to read/encode image {image_path}: {e}")
            raise RuntimeError(f"Failed to read image: {e}")

        if self.config.use_local_model:
            model_name = self.config.ollama_deepseek_model
            if "deepseek-ocr" in model_name.lower():
                prompt = "Free OCR."
            else:
                prompt = (
                    "Perform OCR on this image. Extract all text content verbatim from this job description. "
                    "Do not add any preamble, comments, or summaries. Output only the extracted text."
                )
        else:
            model_name = "gemini-3.5-flash"
            prompt = (
                "Perform OCR on this image. Extract all text content verbatim from this job description. "
                "Do not add any preamble, comments, or summaries. Output only the extracted text."
            )

        logger.info(f"Sending JD image {image_path.name} to vision model: {model_name}")
        try:
            from src.llm_client import call_llm

            ocr_text = await call_llm(
                config=self.config,
                session=self.session,
                model=model_name,
                purpose="ocr_extraction",
                prompt=prompt,
                images=[encoded_string],
                temperature=0.0,
            )
            if not ocr_text:
                logger.warning(f"Vision model returned empty OCR text for {image_path.name}")
            return ocr_text
        except Exception as e:
            logger.error(f"Error calling vision OCR API: {e}")
            raise RuntimeError(f"Vision OCR call failed: {e}")
