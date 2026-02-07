#!/bin/bash

# Expenses Project Setup Script
# This script helps set up the development environment

set -e  # Exit on error

echo "🚀 Expenses Project Setup"
echo "========================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js 18+ is required. You have $(node -v)"
  exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check pnpm
echo ""
echo "Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm not found. Installing pnpm..."
  npm install -g pnpm@9.15.0 --registry https://registry.npmjs.org/
else
  echo "✅ pnpm found: $(pnpm -v)"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
pnpm install --registry https://registry.npmjs.org/

# Check for .env files
echo ""
echo "Checking environment files..."

if [ ! -f apps/mobile/.env ]; then
  echo "⚠️  apps/mobile/.env not found"
  echo "   Creating from template..."
  cp apps/mobile/.env.example apps/mobile/.env
  echo "   ✅ Created apps/mobile/.env - PLEASE EDIT WITH YOUR VALUES"
fi

if [ ! -f apps/web/.env.local ]; then
  echo "⚠️  apps/web/.env.local not found"
  echo "   Creating from template..."
  cp apps/web/.env.example apps/web/.env.local
  echo "   ✅ Created apps/web/.env.local - PLEASE EDIT WITH YOUR VALUES"
fi

# Run tests
echo ""
echo "Running tests..."
pnpm test

# Summary
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit apps/mobile/.env with your Supabase and Google OAuth credentials"
echo "2. Edit apps/web/.env.local with your Supabase credentials"
echo "3. Start mobile app: pnpm start:mobile"
echo "4. Start web app: pnpm dev:web"
echo ""
echo "See CONTRIBUTING.md for detailed development instructions."
echo ""
