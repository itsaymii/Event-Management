@echo off
REM Restart Vite dev server and clear cache

echo.
echo ========================================
echo Stopping old dev server...
echo ========================================
taskkill /F /IM node.exe /T 2>nul

echo.
echo ========================================
echo Cleaning Vite cache...
echo ========================================
cd frontend
rmdir /S /Q node_modules\.vite 2>nul
rmdir /S /Q dist 2>nul

echo.
echo ========================================
echo Starting fresh Vite dev server...
echo ========================================
echo.
echo Frontend will use: http://localhost:8000/api
echo (from .env.local file)
echo.

npm run dev

pause
