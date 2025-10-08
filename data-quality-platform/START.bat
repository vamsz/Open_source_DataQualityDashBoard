@echo off
echo ========================================
echo  DATA QUALITY PLATFORM - STARTUP
echo ========================================
echo.

cd backend
echo Starting Backend Server...
start "Backend Server" cmd /k "node standalone-server.js"

timeout /t 3 /nobreak >nul

cd ..\frontend
echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo  SERVERS STARTING...
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Open your browser to: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul

