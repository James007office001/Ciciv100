#!/bin/bash

# CICI Application Layer Deployment Script
# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "========================================"
echo "   CICI Application Layer Deployment"
echo "========================================"
echo -e "${NC}"

echo -e "${BLUE}[INFO]${NC} Starting CICI Application Layer deployment..."
echo

# Check Docker installation
echo -e "${BLUE}[CHECK]${NC} Checking Docker status..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Docker is not installed!"
    echo "Please install Docker and ensure it's running."
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Docker is available"
echo

# Check Docker Compose
echo -e "${BLUE}[CHECK]${NC} Checking Docker Compose..."
if ! docker compose version &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Docker Compose is not available!"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Docker Compose is available"
echo

# Stop existing containers
echo -e "${BLUE}[INFO]${NC} Stopping existing application containers..."
docker compose down --remove-orphans
echo

# Build application image
echo -e "${BLUE}[INFO]${NC} Building CICI application image..."
if ! docker compose build app; then
    echo -e "${RED}[ERROR]${NC} Failed to build application image!"
    exit 1
fi
echo -e "${GREEN}[OK]${NC} Application image built successfully"
echo

# Start Application Layer services
echo -e "${BLUE}[INFO]${NC} Starting Application Layer services..."
echo "  - Node.js Express Server"
echo "  - Socket.IO Server"
echo "  - File Service"
echo "  - Cache Layer (Redis)"
echo

# Start Redis cache
echo -e "${BLUE}[INFO]${NC} Starting Redis Cache..."
docker compose up -d redis
sleep 5
echo -e "${GREEN}[OK]${NC} Redis Cache started"

# Start application server
echo -e "${BLUE}[INFO]${NC} Starting Application Server..."
docker compose up -d app
sleep 10
echo -e "${GREEN}[OK]${NC} Application Server started"

# Start Nginx file service
echo -e "${BLUE}[INFO]${NC} Starting Nginx File Service..."
docker compose up -d nginx
sleep 5
echo -e "${GREEN}[OK]${NC} Nginx File Service started"
echo

# Wait for services to be ready
echo -e "${BLUE}[INFO]${NC} Waiting for services to be ready..."
sleep 15

# Health checks
echo -e "${BLUE}[INFO]${NC} Performing health checks..."
echo

# Check Redis
echo -e "${BLUE}[CHECK]${NC} Testing Redis connection..."
if docker exec cici-app node -e "
const redis = require('redis');
const client = redis.createClient({
  host: 'redis',
  port: 6379,
  password: 'redis123'
});
client.connect().then(() => {
  console.log('Redis connection: OK');
  client.disconnect();
}).catch(err => {
  console.log('Redis connection: FAILED');
  process.exit(1);
});
" 2>/dev/null; then
    echo -e "${GREEN}[OK]${NC} Redis Cache is healthy"
else
    echo -e "${YELLOW}[WARNING]${NC} Redis Cache health check failed"
fi

# Check application server
echo -e "${BLUE}[CHECK]${NC} Testing Application Server..."
if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo -e "${GREEN}[OK]${NC} Application Server is healthy"
else
    echo -e "${YELLOW}[WARNING]${NC} Application Server health check failed"
fi

# Check file service
echo -e "${BLUE}[CHECK]${NC} Testing File Service..."
if curl -f http://localhost:8080 >/dev/null 2>&1; then
    echo -e "${GREEN}[OK]${NC} Nginx File Service is healthy"
else
    echo -e "${YELLOW}[WARNING]${NC} Nginx File Service health check failed"
fi

echo
echo -e "${BLUE}"
echo "========================================"
echo "    Application Layer Status"
echo "========================================"
echo -e "${NC}"

# Show container status
echo -e "${BLUE}[INFO]${NC} Container Status:"
docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
echo

echo -e "${BLUE}[INFO]${NC} Application Layer Services:"
echo "  ✓ Express Server     : http://localhost:3000"
echo "  ✓ Socket.IO Server   : ws://localhost:3000"
echo "  ✓ File Service       : http://localhost:8080"
echo "  ✓ Redis Cache        : localhost:6379"
echo "  ✓ Health Check       : http://localhost:3000/health"
echo "  ✓ API Info           : http://localhost:3000/api/info"
echo

echo -e "${BLUE}[INFO]${NC} Key Features Available:"
echo "  - RESTful API endpoints"
echo "  - Real-time WebSocket communication"
echo "  - File upload/download service"
echo "  - Redis caching layer"
echo "  - JWT authentication"
echo "  - Rate limiting"
echo "  - Request logging"
echo

# Check logs
echo -e "${BLUE}[INFO]${NC} Checking recent logs..."
echo
echo -e "${BLUE}[LOGS]${NC} Application Server:"
docker compose logs --tail 5 app
echo

echo -e "${GREEN}"
echo "========================================"
echo "  Application Layer Deployment Complete!"
echo "========================================"
echo -e "${NC}"

echo "Press Enter to view live logs, or Ctrl+C to exit..."
read

# Show live logs
echo -e "${BLUE}[INFO]${NC} Showing live application logs (Ctrl+C to exit)..."
docker compose logs -f app