FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Install minimal system deps for building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt


# Remove all Python cache files before copying code
RUN find . -name "__pycache__" -type d -exec rm -rf {} + && find . -name "*.pyc" -delete

# Copy backend code
COPY . /app
# Copy test files from project root into image
COPY ../tests /app/tests

ENV PORT=5050
EXPOSE 5050

# Use Gunicorn with the WSGI entrypoint for production
CMD ["gunicorn", "-b", "0.0.0.0:5050", "wsgi:application", "--workers", "2"]
