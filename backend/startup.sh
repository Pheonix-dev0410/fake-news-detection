#!/bin/bash
# Install dependencies
pip install -r requirements.txt

# Start the FastAPI app with Gunicorn and Uvicorn worker
exec gunicorn --worker-class uvicorn.workers.UvicornWorker --bind=0.0.0.0 --timeout 600 main:app 