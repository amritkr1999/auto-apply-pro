import logging
from pathlib import Path
from pypdf import PdfReader
from docx import Document
from src.config import Settings

logger = logging.getLogger(__name__)

class FileLoader:
    def __init__(self, config: Settings = None):
        self.config = config

    def load(self, file_path: Path) -> str:
        """Loads a file from path and extracts its textual content based on the file extension."""
        if not file_path.exists():
            logger.error(f"Resume file not found: {file_path}")
            raise FileNotFoundError(f"Resume file not found: {file_path}")

        suffix = file_path.suffix.lower()
        logger.info(f"Loading resume file {file_path.name} (type: {suffix})")

        try:
            if suffix == ".pdf":
                return self._load_pdf(file_path)
            elif suffix in [".docx", ".doc"]:
                return self._load_docx(file_path)
            elif suffix in [".md", ".txt"]:
                return self._load_text(file_path)
            else:
                raise ValueError(f"Unsupported file format: {suffix}")
        except Exception as e:
            logger.error(f"Failed to parse resume file {file_path.name}: {e}")
            raise RuntimeError(f"Failed to read file {file_path.name}: {e}")

    def _load_pdf(self, file_path: Path) -> str:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text

    def _load_docx(self, file_path: Path) -> str:
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])

    def _load_text(self, file_path: Path) -> str:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
