@echo off
setlocal

echo ==============================================
echo  Hotel Management - Build and Run All Services
echo ==============================================

REM Navigate to script directory (project root)
cd /d %~dp0

echo Stopping and removing existing containers...
docker compose down
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [WARNING] Failed to stop containers. They may not exist or Docker is not running.
)

echo Removing existing images...
docker rmi hotelmanagement-api hotelmanagement-frontend --force
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [WARNING] Failed to remove images. They may not exist or are in use.
)

echo Building and starting Docker services with fresh images...
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
echo - SQLServer: localhost,1433 (user: sa, pass: 55555)

echo.
echo To view logs: docker compose logs -f
echo To stop:      docker compose down

echo.
echo All services started successfully!
echo Press any key to exit...
pause >nul
