#!/bin/bash

echo "🧪 Testing Docker build process..."

# Clean up any existing containers
docker-compose -f docker-compose.test.yml down 2>/dev/null || true

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t krolikkanban-test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    
    # Test the container
    echo "🚀 Testing container..."
    docker run -d --name krolikkanban-test -p 3000:3000 krolikkanban-test
    
    # Wait for the container to start
    echo "⏳ Waiting for container to start..."
    sleep 15
    
    # Test health endpoint
    echo "🏥 Testing health endpoint..."
    if curl -f http://localhost:3000/api/health; then
        echo "✅ Health check passed!"
    else
        echo "❌ Health check failed!"
    fi
    
    # Clean up
    echo "🧹 Cleaning up..."
    docker stop krolikkanban-test
    docker rm krolikkanban-test
    docker rmi krolikkanban-test
    
    echo "🎉 All tests passed!"
else
    echo "❌ Docker build failed!"
    exit 1
fi 