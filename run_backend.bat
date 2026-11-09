@echo off
echo ========================================================
echo   Data_Analyzer - Starting Python FastAPI Backend Server
echo ========================================================
cd /d "%~dp0backend"
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\pip install -r requirements.txt
)
echo Starting FastAPI on http://localhost:8000 ...
.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
