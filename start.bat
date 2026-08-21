@echo off
echo ===================================================
echo   Starting NIVARA Backend and Frontend Servers
echo ===================================================
echo.

:: Detect Python executable
set PYTHON_EXE=python
where py >nul 2>nul && set PYTHON_EXE=py -3.12
where python >nul 2>nul || (
    if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
        set PYTHON_EXE="%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    )
)

echo Starting FastAPI Backend on http://localhost:8000 ...
start "NIVARA Backend (FastAPI)" cmd /k "cd /d %~dp0backend && %PYTHON_EXE% run.py"

echo Starting Expo Frontend on http://localhost:8081 ...
start "NIVARA Frontend (Expo Web)" cmd /k "cd /d %~dp0frontend && npx.cmd expo start --web"

echo.
echo Both backend and frontend servers are launching!
echo Backend:  http://localhost:8000/docs
echo Frontend: http://localhost:8081
echo.
