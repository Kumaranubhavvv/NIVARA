@echo off
echo ===================================================
echo   Starting NIVARA Backend and Frontend Servers
echo ===================================================
echo.
echo Starting FastAPI Backend on http://localhost:8000 ...
start "NIVARA Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python run.py"

echo Starting Expo Frontend ...
start "NIVARA Frontend (Expo)" cmd /k "cd /d %~dp0frontend && npx expo start"

echo Starting Modern UI Web App on http://localhost:5173 ...
start "NIVARA Web App (Vite)" cmd /k "cd /d %~dp0webapp && npm run dev"

echo.
echo Backend, Expo Frontend, and Animated Web App have been opened!
