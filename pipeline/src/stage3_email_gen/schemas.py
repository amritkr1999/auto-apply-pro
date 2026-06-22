from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class Email(BaseModel):
    recipient_email: str
    recipient_name: Optional[str] = None
    subject: str
    body: str
    generated_at: datetime
    jd_source: str
    candidate_source: str
    job_title: str
    company: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "recipient_email": "hr@company.com",
                "recipient_name": "Hiring Manager",
                "subject": "Experienced Python Developer - [Company Name]",
                "body": "Dear Hiring Manager...",
                "job_title": "Senior Python Developer",
                "company": "TechCorp"
            }
        }
