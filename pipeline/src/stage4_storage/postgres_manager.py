import logging
from contextlib import asynccontextmanager
from typing import Optional, List
import asyncpg
from src.stage4_storage.schemas import StoredEmail

logger = logging.getLogger(__name__)

class PostgresManager:
    def __init__(self, config):
        self.config = config
        self.pool: Optional[asyncpg.Pool] = None
    
    async def initialize(self):
        """Create connection pool at startup"""
        try:
            # Strip sqlalchemy prefix if present: postgresql+asyncpg://... -> postgresql://...
            db_url = self.config.database_url
            if db_url.startswith("postgresql+asyncpg://"):
                db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
            
            logger.info(f"Initializing PostgreSQL pool using: {db_url}")
            self.pool = await asyncpg.create_pool(
                dsn=db_url,
                min_size=self.config.database_pool_size // 2,
                max_size=self.config.database_pool_size,
                max_queries=50000,
                max_cached_statement_lifetime=300,
                max_cacheable_statement_size=15000,
                command_timeout=self.config.database_pool_timeout_seconds,
                server_settings={'jit': 'off'},  # Disable JIT for faster execution
            )
            logger.info(f"PostgreSQL connection pool initialized: {self.config.database_pool_size} connections max")
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL pool: {e}")
            raise
    
    async def close(self):
        """Close connection pool at shutdown"""
        if self.pool:
            await self.pool.close()
            logger.info("PostgreSQL connection pool closed")
    
    @asynccontextmanager
    async def get_connection(self):
        """Context manager for getting a connection from pool"""
        if not self.pool:
            raise RuntimeError("Pool not initialized. Call initialize() first.")
        
        conn = await self.pool.acquire()
        try:
            yield conn
        finally:
            await self.pool.release(conn)
    
    async def save_email(self, conn: asyncpg.Connection, email: StoredEmail) -> StoredEmail:
        """Save email to database"""
        query = """
        INSERT INTO emails (
            recipient_email, recipient_name, subject, body, 
            status, job_title, company, candidate_name,
            jd_source, candidate_source, generated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, created_at, updated_at
        """
        
        row = await conn.fetchrow(
            query,
            email.recipient_email,
            email.recipient_name,
            email.subject,
            email.body,
            email.status or 'pending',
            email.job_title,
            email.company,
            email.candidate_name,
            email.jd_source,
            email.candidate_source,
            email.generated_at,
        )
        
        email.id = row['id']
        logger.info(f"Email saved with ID {email.id}")
        return email
    
    async def get_email(self, conn: asyncpg.Connection, email_id: int) -> Optional[StoredEmail]:
        """Retrieve email by ID"""
        query = "SELECT * FROM emails WHERE id = $1"
        row = await conn.fetchrow(query, email_id)
        
        if row:
            return StoredEmail(**dict(row))
        return None
    
    async def list_pending(self, conn: asyncpg.Connection, limit: int = 100) -> List[StoredEmail]:
        """Get pending emails"""
        query = "SELECT * FROM emails WHERE status = 'pending' ORDER BY created_at LIMIT $1"
        rows = await conn.fetch(query, limit)
        return [StoredEmail(**dict(row)) for row in rows]
    
    async def mark_sent(self, conn: asyncpg.Connection, email_id: int) -> bool:
        """Mark email as sent"""
        query = """
        UPDATE emails 
        SET status = 'sent', sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
        """
        result = await conn.fetchval(query, email_id)
        return result is not None
    
    async def mark_failed(self, conn: asyncpg.Connection, email_id: int, error_msg: str) -> bool:
        """Mark email as failed with error message"""
        query = """
        UPDATE emails 
        SET status = 'failed', error_message = $2, retry_count = retry_count + 1, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
        """
        result = await conn.fetchval(query, email_id, error_msg)
        return result is not None
    
    async def run_migrations(self):
        """Run Alembic migrations"""
        import subprocess
        logger.info("Applying database migrations via Alembic...")
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            logger.error(f"Migration failed: {result.stderr}")
            raise RuntimeError(f"Database migration failed: {result.stderr}")
        logger.info("Database migrations applied successfully")
