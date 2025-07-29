#!/bin/bash

# KrolikKanban Deploy Script
# Usage: ./deploy.sh [production|development]

set -e

ENVIRONMENT=${1:-development}
PROJECT_NAME="krolikkanban"

echo "🚀 Deploying KrolikKanban to $ENVIRONMENT environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Please edit .env file with your configuration before continuing."
        echo "   Required variables:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        exit 1
    else
        echo "❌ .env.example file not found. Please create a .env file manually."
        exit 1
    fi
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Remove old images
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start containers
echo "🔨 Building and starting containers..."
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🏭 Production mode: Building optimized image..."
    docker-compose -f docker-compose.yml up --build -d
else
    echo "🛠️  Development mode: Building with hot reload..."
    docker-compose -f docker-compose.yml up --build
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deploy successful!"
    echo "🌐 Application is running at:"
    echo "   - Main app: http://localhost"
    echo "   - Direct app: http://localhost:3000"
    echo "   - Database: localhost:5432"
    echo "   - Redis: localhost:6379"
    
    echo ""
    echo "📊 Container status:"
    docker-compose ps
    
    echo ""
    echo "📝 Useful commands:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Stop: docker-compose down"
    echo "   - Restart: docker-compose restart"
    echo "   - Update: ./deploy.sh $ENVIRONMENT"
    
else
    echo "❌ Deploy failed. Check logs with: docker-compose logs"
    exit 1
fi