#!/bin/bash

# Build script for AI-Nx-Starter Docker image

set -e # Exit on any error

echo "🚀 Building AI-Nx-Starter Docker image..."

# Build the Docker image
docker build -t ai-nx-starter:latest .

echo "✅ Docker image built successfully!"
echo ""
echo "To run the application:"
echo "  docker-compose up -d"
echo ""
echo "To run just the app (if you have a separate database):"
echo "  docker run -p 3030:3030 --name ai-nx-starter-container ai-nx-starter:latest"
echo ""
echo "The application will be available at:"
echo "  - Frontend: http://localhost:3030"
echo "  - API: http://localhost:3030/api"
echo "  - pgAdmin: http://localhost:8888 (admin@gmail.com / admin)"
