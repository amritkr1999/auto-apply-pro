from src.stage1_jd_extraction.schemas import JobDescription, Salary
from src.stage2_resume_parsing.schemas import Candidate, ExperienceEntry, Education
from src.stage3_email_gen.schemas import Email
from src.stage4_storage.schemas import StoredEmail

__all__ = [
    "Salary",
    "JobDescription",
    "Candidate",
    "ExperienceEntry",
    "Education",
    "Email",
    "StoredEmail",
]
