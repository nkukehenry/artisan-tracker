#!/bin/bash

# Tracker API Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e  # Exit on error

ENVIRONMENT=${1:-production}
APP_NAME="tracker-api"
APP_DIR="/var/www/tracker/backend"
BRANCH="main"

echo "🚀 Starting deployment for $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if running as root (skip on Windows)
if [ -n "$EUID" ] && [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root"
    exit 1
fi

# Check if .env file exists
if [ ! -f "$APP_DIR/.env" ]; then
    print_error ".env file not found in $APP_DIR"
    print_warning "Please create .env file from env.example"
    exit 1
fi

# Navigate to app directory
cd $APP_DIR
print_message "Changed to $APP_DIR"

# Pull latest code
print_message "Pulling latest code from $BRANCH branch..."

# Fix git ownership issue if it exists
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true

git fetch origin
git reset --hard origin/$BRANCH
print_message "Code updated successfully"

# Install dependencies
print_message "Installing dependencies..."
npm ci --production=false
print_message "Dependencies installed"

# Run database migrations
print_message "Running database migrations..."
npx prisma migrate deploy
print_message "Database migrations completed"

# Generate Prisma client
print_message "Generating Prisma client..."
npx prisma generate
print_message "Prisma client generated"

# Build TypeScript
print_message "Building TypeScript..."
npm run build
print_message "Build completed"

# Check PM2 status
if pm2 list | grep -q "$APP_NAME"; then
    print_message "Reloading PM2 application..."
    pm2 reload ecosystem.config.js --env $ENVIRONMENT
else
    print_message "Starting PM2 application..."
    pm2 start ecosystem.config.js --env $ENVIRONMENT
fi

# Save PM2 configuration
pm2 save

print_message "Deployment completed successfully! 🎉"

# Show application status
echo ""
echo "Application Status:"
pm2 show $APP_NAME

echo ""
echo "Recent logs:"
pm2 logs $APP_NAME --lines 20 --nostream

