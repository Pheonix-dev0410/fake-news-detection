#!/bin/bash
cd backend
gunicorn main:app --bind=0.0.0.0 --timeout 600 