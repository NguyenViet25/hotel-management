@echo off
setlocal

echo ==============================================
echo  Hotel Management - Build and Run All Services
echo ==============================================

REM Navigate to script directory (project root)
cd /d %~dp0

echo Building and starting Docker services...
docker compose up -d 
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] docker compose failed. Ensure Docker Desktop is running.
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo Services are starting. Access them here:
echo - API:       http://localhost:5000
echo - Frontend:  http://localhost:8080
echo - SQLServer: localhost,1433 (user: sa, pass: Your_password123)

echo.
echo To view logs: docker compose logs -f
echo To stop:      docker compose down

echo.
echo All services started successfully!
echo Press any key to exit...
pause >nul
