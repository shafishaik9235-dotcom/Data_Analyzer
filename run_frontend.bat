@echo off
echo ========================================================
echo   Data_Analyzer - Starting React Vite Frontend Server
echo ========================================================
cd /d "%~dp0frontend"
echo Starting Vite on http://localhost:5173 ...
call npm run dev
