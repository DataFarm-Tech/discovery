FROM python:latest


# Set environment variables
ENV APP_HOME /app
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR $APP_HOME

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI application code to the container
COPY . .

# Create non-root user if needed (optional step)
RUN adduser --disabled-password appuser
USER appuser

# Expose port 443 for HTTPS
EXPOSE 8000


# Start FastAPI with HTTPS
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

