#!/bin/bash

# Build script for Monorepo Kit Docker image

set -e # Exit on any error

echo "🚀 Building Monorepo Kit Docker image..."

# Build the Docker image
docker build -t monorepo-kit:latest .

echo "✅ Docker image built successfully!"
echo ""
echo "To run the application:"
echo "  docker-compose up -d"
echo ""
echo "To run just the app (if you have a separate database):"
echo "  docker run -p 3030:3030 --name monorepo-kit-container monorepo-kit:latest"
echo ""
echo "The application will be available at:"
echo "  - Frontend: http://localhost:3030"
echo "  - API: http://localhost:3030/api"
echo "  - pgAdmin: http://localhost:8888 (admin@gmail.com / admin)"
