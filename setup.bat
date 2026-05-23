@echo off
REM Quick Start Script for Construction Scheduling App (Windows)

echo 🏗️  Construction Scheduling Tool - Setup
echo =========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or later.
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found

REM Check if Docker is available (optional)
where docker >nul 2>nul
if errorlevel 1 (
    echo ⚠️  Docker not found. You'll need to set up PostgreSQL manually.
) else (
    echo ✅ Docker found
)

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔧 Setting up environment...

REM Create .env.local if it doesn't exist
if not exist .env.local (
    copy .env.local.example .env.local
    echo ✅ Created .env.local
)

echo.
echo 🗄️  Setting up database...
call npm run db:generate
call npm run db:push

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. npm run dev          - Start development server
echo 2. npm run db:studio    - Open Drizzle Studio
echo.
echo App will be available at http://localhost:3000
