FROM python:3.12-slim

WORKDIR /app

# Install dependencies directly to keep build fast
RUN pip install --no-cache-dir \
    fastapi==0.100.0 \
    uvicorn==0.22.0 \
    pydantic>=2.0 \
    pydantic-settings>=2.0 \
    python-dotenv>=1.0 \
    aiohttp>=3.8 \
    pillow>=9.0 \
    pypdf>=3.0 \
    python-docx>=0.8 \
    asyncpg>=0.28 \
    sqlalchemy>=2.0 \
    alembic>=1.12 \
    email-validator>=2.0 \
    psutil>=5.9 \
    loguru>=0.7 \
    python-multipart>=0.0.6 \
    google-generativeai>=0.8.3

# Copy the rest of the application code
COPY . .

# Set PYTHONPATH so src modules resolve correctly
ENV PYTHONPATH=/app

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI
CMD ["python", "src/server.py"]
