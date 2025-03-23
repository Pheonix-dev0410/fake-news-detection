#!/bin/bash
echo "Starting deployment script at $(date)" >> /home/LogFiles/startup.log 2>&1
cd /home/site/wwwroot
echo "Changed directory to $(pwd)" >> /home/LogFiles/startup.log 2>&1

echo "Installing requirements..." >> /home/LogFiles/startup.log 2>&1
pip install -r requirements.txt >> /home/LogFiles/startup.log 2>&1

export PORT="${PORT:-8000}"
echo "Set PORT to $PORT" >> /home/LogFiles/startup.log 2>&1
echo "Starting gunicorn..." >> /home/LogFiles/startup.log 2>&1
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --log-level debug --error-logfile /home/LogFiles/gunicorn-error.log --access-logfile /home/LogFiles/gunicorn-access.log 