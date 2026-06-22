import logging
import sys
import psutil
import asyncio
from pathlib import Path
from src.config import Settings

logger = logging.getLogger(__name__)

def setup_logging(config: Settings):
    """Configures system-wide logging based on user settings."""
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    level = getattr(logging, config.log_level.upper(), logging.INFO)
    
    # Ensure log directory exists
    log_path = Path(config.log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    
    logging.basicConfig(
        level=level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(config.log_file, encoding="utf-8")
        ],
        force=True
    )
    logger.info("Logging configured successfully.")

async def check_memory_and_pause(threshold_gb: float = 14.0):
    """Monitors virtual memory and pauses execution if memory consumption exceeds threshold."""
    # Convert virtual memory usage
    mem = psutil.virtual_memory()
    used_gb = mem.used / (1024 ** 3)
    if used_gb > threshold_gb:
        logger.warning(f"High memory usage detected: {used_gb:.2f} GB used. Pausing pipeline execution for garbage collection...")
        # Await standard cooldown
        await asyncio.sleep(10)
