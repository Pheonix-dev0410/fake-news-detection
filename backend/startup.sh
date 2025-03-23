#!/bin/bash
cd /home/site/wwwroot
export PORT="${PORT:-8000}"
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT 