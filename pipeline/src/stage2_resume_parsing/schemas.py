from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ExperienceEntry(BaseModel):
    title: Optional[str] = "Unknown Title"
    company: Optional[str] = "Unknown Company"
    duration: Optional[str] = None
    description: Optional[str] = None

class Education(BaseModel):
    degree: Optional[str] = "Unknown Degree"
    institution: Optional[str] = "Unknown Institution"
    graduation_year: Optional[int] = None
    field_of_study: Optional[str] = None

class Candidate(BaseModel):
    name: Optional[str] = "Unknown Candidate"
    email: Optional[str] = "unknown@example.com"
    phone: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    experience: List[ExperienceEntry] = []
    education: List[Education] = []
    certifications: List[str] = []
    summary: Optional[str] = None
    raw_text: str
    source_filename: str
    parsed_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+1-555-0100",
                "skills": ["Python", "FastAPI", "AWS"],
                "experience": [
                    {
                        "title": "Senior Developer",
                        "company": "TechCorp",
                        "duration": "2021-2024"
                    }
                ],
                "education": [
                    {
                        "degree": "B.S.",
                        "institution": "State University",
                        "graduation_year": 2018
                    }
                ]
            }
        }
