@echo off
call .venv\Scripts\activate
python -m pip install -r requirements.txt
start "GovPilot Backend" cmd /k ".venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
