from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_deepseek_model: str = "deepseek-vision:7b"
    ollama_llm_model: str = "ollama3.1:8b"
    ollama_timeout_seconds: int = 120
    ollama_temperature: float = 0.7
    
    # Pipeline
    pipeline_batch_size: int = 5
    pipeline_memory_threshold_gb: int = 14
    pipeline_retry_attempts: int = 3
    pipeline_dry_run: bool = True
    
    # PostgreSQL Database
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/auto_apply_pro"
    database_pool_size: int = 10
    database_max_overflow: int = 5
    database_pool_timeout_seconds: int = 30
    database_echo_sql: bool = False
    
    # Storage
    storage_archive_after_days: int = 30
    storage_retention_policy_enabled: bool = True
    
    # SMTP
    smtp_enabled: bool = False
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_name: str = "Auto Apply Pro"
    smtp_rate_limit_seconds: int = 5
    
    # Backend
    backend_api_url: str = "http://localhost:8060"
    backend_api_token: str = ""
    backend_sync_enabled: bool = True
    backend_sync_interval_seconds: int = 60
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "./logs/pipeline.log"
    log_format: str = "json"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
