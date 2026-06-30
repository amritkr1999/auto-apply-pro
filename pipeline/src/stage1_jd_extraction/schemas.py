from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class Salary(BaseModel):
    min: Optional[int] = None
    max: Optional[int] = None
    currency: Optional[str] = "USD"

class JobDescription(BaseModel):
    job_title: str
    company: str
    skills: List[str]
    salary: Optional[Salary] = None
    recruiter_emails: List[str] = []
    experience_required: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None  # Full-time, Contract, etc
    description: Optional[str] = None
    raw_ocr_text: str
    source_filename: str
    extracted_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "job_title": "Senior Python Developer",
                "company": "TechCorp",
                "skills": ["Python", "FastAPI", "PostgreSQL"],
                "salary": {"min": 120000, "max": 150000, "currency": "USD"},
                "recruiter_emails": ["hr@techcorp.com"],
                "location": "San Francisco, CA",
                "job_type": "Full-time",
                "extracted_at": "2026-06-22T10:30:00Z"
            }
        }
