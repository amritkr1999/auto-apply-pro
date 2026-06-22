from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class StoredEmail(BaseModel):
    id: Optional[int] = None
    recipient_email: str
    recipient_name: Optional[str] = None
    subject: str
    body: str
    status: str = "pending"  # "pending", "sent", "failed", "draft"
    generated_at: datetime
    sent_at: Optional[datetime] = None
    job_title: str
    company: str
    candidate_name: str
    error_message: Optional[str] = None
    retry_count: int = 0
    jd_source: Optional[str] = None
    candidate_source: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "recipient_email": "hr@company.com",
                "subject": "Experienced Python Developer - [Company Name]",
                "status": "pending",
                "generated_at": "2026-06-22T10:30:00Z",
                "job_title": "Senior Python Developer",
                "company": "TechCorp",
                "candidate_name": "John Doe"
            }
        }
