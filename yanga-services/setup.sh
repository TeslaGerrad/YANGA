#!/bin/bash

# Yanga Rides - Complete Setup Script

set -e

echo "🚀 Setting up Yanga Rides Microservices..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Copy environment files
echo -e "${BLUE}📝 Step 1: Setting up environment files...${NC}"
for service in services/auth-service services/trip-service services/driver-service services/rating-service api-gateway; do
    if [ ! -f "$service/.env" ]; then
        cp "$service/.env.example" "$service/.env"
        echo -e "${GREEN}✅ Created $service/.env${NC}"
    else
        echo -e "${YELLOW}⚠️  $service/.env already exists${NC}"
    fi
done

# Step 2: Install Go dependencies
echo -e "\n${BLUE}📦 Step 2: Installing Go dependencies...${NC}"
cd shared-lib && go mod tidy && cd ..
for service in services/auth-service services/trip-service services/driver-service services/rating-service api-gateway; do
    echo "Installing dependencies for $service..."
    cd "$service" && go mod tidy && cd ../..
done
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Start Docker services
echo -e "\n${BLUE}🐳 Step 3: Starting Docker services...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Docker services started${NC}"

# Wait for PostgreSQL to be ready
echo -e "\n${BLUE}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Step 4: Initialize database
echo -e "\n${BLUE}🗄️  Step 4: Initializing database...${NC}"
PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c "CREATE DATABASE yanga_db;" 2>/dev/null || echo "Database already exists"
PGPASSWORD=postgres psql -h localhost -U postgres -d yanga_db -f db/schema.sql
echo -e "${GREEN}✅ Database initialized${NC}"

# Step 5: Generate sqlc code
echo -e "\n${BLUE}⚙️  Step 5: Generating sqlc code...${NC}"
for service in services/auth-service services/trip-service services/driver-service services/rating-service; do
    echo "Generating sqlc for $service..."
    cd "$service" && sqlc generate && cd ../..
done
echo -e "${GREEN}✅ sqlc code generated${NC}"

# Step 6: Build all services
echo -e "\n${BLUE}🔨 Step 6: Building services...${NC}"
mkdir -p bin
go build -o bin/auth-service services/auth-service/cmd/main.go
go build -o bin/trip-service services/trip-service/cmd/main.go
go build -o bin/driver-service services/driver-service/cmd/main.go
go build -o bin/rating-service services/rating-service/cmd/main.go
go build -o bin/api-gateway api-gateway/cmd/main.go
echo -e "${GREEN}✅ All services built${NC}"

echo -e "\n${GREEN}✨ Setup complete!${NC}"
echo -e "\n${BLUE}To start all services, run:${NC}"
echo -e "  ${YELLOW}make run-all${NC}"
echo -e "\n${BLUE}Or start services individually:${NC}"
echo -e "  ${YELLOW}make run-auth${NC}      # Auth Service (8081)"
echo -e "  ${YELLOW}make run-trip${NC}      # Trip Service (8082)"
echo -e "  ${YELLOW}make run-driver${NC}    # Driver Service (8083)"
echo -e "  ${YELLOW}make run-rating${NC}    # Rating Service (8084)"
echo -e "  ${YELLOW}make run-gateway${NC}   # API Gateway (8080)"
echo -e "\n${BLUE}Access the API:${NC}"
echo -e "  ${YELLOW}http://localhost:8080${NC}           # API Gateway"
echo -e "  ${YELLOW}http://localhost:8080/swagger/${NC}  # Swagger Docs"
