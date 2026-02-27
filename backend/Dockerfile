FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

# Non-root user
RUN useradd -m django && chown -R django:django /app
USER django

# Create required directories
RUN mkdir -p /app/logs /app/staticfiles /app/media

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/health/', timeout=5)" || exit 1

ENTRYPOINT ["bash", "docker-entrypoint.sh"]
