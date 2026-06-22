from src.stage1_jd_extraction.schemas import JobDescription
from src.stage2_resume_parsing.schemas import Candidate

class PromptBuilder:
    def __init__(self, config=None):
        self.config = config

    def build(self, jd: JobDescription, candidate: Candidate) -> str:
        """Constructs a detailed instruction prompt for Ollama to generate a tailored job outreach email."""
        prompt = f"""
        You are a highly skilled professional outreach assistant. Your task is to write a highly tailored, compelling job application outreach email from the candidate to the hiring manager or recruiter.
        
        Job Details:
        - Job Title: {jd.job_title}
        - Company: {jd.company}
        - Required Skills: {', '.join(jd.skills)}
        - Location: {jd.location or 'Not specified'}
        - Job Type: {jd.job_type or 'Not specified'}
        
        Candidate Profile:
        - Name: {candidate.name}
        - Contact Email: {candidate.email}
        - Contact Phone: {candidate.phone or 'Not specified'}
        - Skills: {', '.join(candidate.skills)}
        - Professional Summary: {candidate.summary or 'Not specified'}
        - Experience Entries:
        """
        
        for exp in candidate.experience:
            prompt += f"  * {exp.title} at {exp.company} ({exp.duration or 'N/A'}): {exp.description or 'No details'}\n"
            
        prompt += """
        Instructions:
        1. Analyze the job requirements (JD) and align the candidate's skills and experiences to match.
        2. Highlight how the candidate can solve problems for the company.
        3. Make the email concise, professional, and clear. Avoid generic boilerplate templates.
        4. Include a call-to-action requesting a chat or brief call.
        
        The output MUST be a JSON object with exactly two fields: "subject" and "body".
        Do not include any extra text, comments, or explanations outside the JSON object.

        Format:
        {
            "subject": "Tailored Email Subject Line",
            "body": "Tailored Email Body Text (using line breaks like \\n where appropriate)"
        }
        """
        return prompt
