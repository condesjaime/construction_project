#!/bin/bash

# Quick Start Script for Construction Scheduling App

set -e

echo "🏗️  Construction Scheduling Tool - Setup"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check if PostgreSQL is installed or Docker
if ! command -v psql &> /dev/null && ! command -v docker &> /dev/null; then
    echo "❌ PostgreSQL or Docker not found. Please install one of them."
    exit 1
fi

echo "✅ PostgreSQL/Docker available"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Setting up environment..."

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
fi

echo ""
echo "🗄️  Setting up database..."

# Generate Drizzle migrations
npm run db:generate

# Push migrations
npm run db:push

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. npm run dev          - Start development server"
echo "2. npm run db:studio    - Open Drizzle Studio"
echo ""
echo "App will be available at http://localhost:3000"
