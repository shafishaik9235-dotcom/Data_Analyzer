@echo off
echo ========================================================
echo   Data_Analyzer - Launching Full-Stack Local Environment
echo ========================================================
start "Data_Analyzer Backend (Port 8000)" cmd /k "run_backend.bat"
start "Data_Analyzer Frontend (Port 5173)" cmd /k "run_frontend.bat"
echo Data_Analyzer is starting!
echo Backend API Docs: http://localhost:8000/api/docs
echo Frontend Web App: http://localhost:5173
echo ========================================================
