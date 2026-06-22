import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.config import Settings
from src.stage4_storage.schemas import StoredEmail

logger = logging.getLogger(__name__)

class SMTPSender:
    def __init__(self, config: Settings):
        self.config = config

    async def send(self, email: StoredEmail) -> bool:
        """Sends an email using standard SMTP. If disabled, simulates a dry run."""
        if not self.config.smtp_enabled:
            logger.info(f"SMTP is disabled (dry run). Simulation for email to: {email.recipient_email}")
            return True
            
        try:
            msg = MIMEMultipart()
            msg['From'] = f"{self.config.smtp_from_name} <{self.config.smtp_username}>"
            msg['To'] = email.recipient_email
            msg['Subject'] = email.subject
            
            msg.attach(MIMEText(email.body, 'plain'))
            
            logger.info(f"Connecting to SMTP server {self.config.smtp_host}:{self.config.smtp_port}")
            # Standard synchronous SMTP connection
            server = smtplib.SMTP(self.config.smtp_host, self.config.smtp_port, timeout=10)
            server.starttls()
            server.login(self.config.smtp_username, self.config.smtp_password)
            text = msg.as_string()
            server.sendmail(self.config.smtp_username, email.recipient_email, text)
            server.quit()
            
            logger.info(f"Email successfully sent via SMTP to {email.recipient_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via SMTP to {email.recipient_email}: {e}")
            raise RuntimeError(f"SMTP sending failed: {e}")
