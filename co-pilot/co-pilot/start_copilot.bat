@echo off
echo Starting GovPilot Servers...

echo Installing Frontend Dependencies...
cd frontend
call npm install --legacy-peer-deps
start "GovPilot Frontend" cmd /k "npm run dev"
cd ..

echo Installing Backend Dependencies...
cd backend
if not exist ".venv" (
    python -m venv .venv
)
call .venv\Scripts\activate
python -m pip install -r requirements.txt
start "GovPilot Backend" cmd /k ".venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
cd ..

echo Both servers are starting...
