from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ExperienceEntry(BaseModel):
    title: str
    company: str
    duration: Optional[str] = None
    description: Optional[str] = None

class Education(BaseModel):
    degree: str
    institution: str
    graduation_year: Optional[int] = None
    field_of_study: Optional[str] = None

class Candidate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    skills: List[str]
    experience: List[ExperienceEntry]
    education: List[Education]
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
