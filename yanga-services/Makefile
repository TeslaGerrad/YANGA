.PHONY: help build run test clean docker-up docker-down migrate-up migrate-down sqlc proto swagger deps

# Variables
SERVICES := auth-service trip-service driver-service rating-service api-gateway
DB_URL := postgresql://postgres:postgres@localhost:5432/yanga_db?sslmode=disable

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '${BLUE}Yanga Rides - Microservices${NC}'
	@echo ''
	@echo 'Usage:'
	@echo '  ${GREEN}make${NC} ${YELLOW}<target>${NC}'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  ${YELLOW}%-20s${NC} %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Development
deps: ## Install dependencies
	@echo "${BLUE}Installing dependencies...${NC}"
	cd shared-lib && go mod download
	@for service in $(SERVICES); do \
		echo "${GREEN}Installing deps for $$service${NC}"; \
		cd services/$$service && go mod download && cd ../..; \
	done

build: ## Build all services
	@echo "${BLUE}Building all services...${NC}"
	@for service in $(SERVICES); do \
		echo "${GREEN}Building $$service${NC}"; \
		cd services/$$service && go build -o ../../bin/$$service ./cmd/main.go && cd ../..; \
	done

build-service: ## Build specific service (make build-service SERVICE=auth-service)
	@echo "${BLUE}Building $(SERVICE)...${NC}"
	cd services/$(SERVICE) && go build -o ../../bin/$(SERVICE) ./cmd/main.go

run-service: ## Run specific service (make run-service SERVICE=auth-service)
	@echo "${GREEN}Running $(SERVICE)...${NC}"
	cd services/$(SERVICE) && go run ./cmd/main.go

run-auth: ## Run auth service
	@$(MAKE) run-service SERVICE=auth-service

run-trip: ## Run trip service
	@$(MAKE) run-service SERVICE=trip-service

run-driver: ## Run driver service
	@$(MAKE) run-service SERVICE=driver-service

run-rating: ## Run rating service
	@$(MAKE) run-service SERVICE=rating-service

run-gateway: ## Run API gateway
	@$(MAKE) run-service SERVICE=api-gateway

run-all: ## Run all services concurrently
	@echo "${BLUE}Starting all services...${NC}"
	@echo "${YELLOW}Press Ctrl+C to stop all services${NC}"
	@trap 'kill 0' SIGINT; \
	$(MAKE) run-auth & \
	$(MAKE) run-trip & \
	$(MAKE) run-driver & \
	$(MAKE) run-rating & \
	$(MAKE) run-gateway & \
	wait

test: ## Run tests for all services
	@echo "${BLUE}Running tests...${NC}"
	cd shared-lib && go test -v ./...
	@for service in $(SERVICES); do \
		echo "${GREEN}Testing $$service${NC}"; \
		cd services/$$service && go test -v ./... && cd ../..; \
	done

test-service: ## Test specific service (make test-service SERVICE=auth-service)
	@echo "${BLUE}Testing $(SERVICE)...${NC}"
	cd services/$(SERVICE) && go test -v ./...

clean: ## Remove build artifacts
	@echo "${RED}Cleaning build artifacts...${NC}"
	rm -rf bin/
	rm -rf tmp/
	@for service in $(SERVICES); do \
		cd services/$$service && go clean && cd ../..; \
	done

## Docker
docker-up: ## Start all containers
	@echo "${BLUE}Starting Docker containers...${NC}"
	docker-compose up -d
	@echo "${GREEN}Containers started successfully${NC}"
	@echo "PostgreSQL: localhost:5432"
	@echo "Adminer: http://localhost:8081"
	@echo "NATS: localhost:4222"

docker-down: ## Stop all containers
	@echo "${RED}Stopping Docker containers...${NC}"
	docker-compose down

docker-logs: ## Show docker logs
	docker-compose logs -f

docker-rebuild: ## Rebuild and restart containers
	@echo "${BLUE}Rebuilding containers...${NC}"
	docker-compose down
	docker-compose up -d --build

## Database
db-create: ## Create database
	@echo "${BLUE}Creating database...${NC}"
	docker exec -it yanga-postgres createdb -U postgres yanga_db || true

db-drop: ## Drop database
	@echo "${RED}Dropping database...${NC}"
	docker exec -it yanga-postgres dropdb -U postgres yanga_db || true

db-reset: db-drop db-create migrate-up ## Reset database

db-dump: ## Create database dump
	@echo "${BLUE}Creating database dump...${NC}"
	docker exec -it yanga-postgres pg_dump -U postgres yanga_db > db/schema.sql
	@echo "${GREEN}Database dumped to db/schema.sql${NC}"

db-restore: ## Restore database from dump
	@echo "${BLUE}Restoring database from dump...${NC}"
	docker exec -i yanga-postgres psql -U postgres yanga_db < db/schema.sql
	@echo "${GREEN}Database restored successfully${NC}"

migrate-up: ## Run database migrations
	@echo "${BLUE}Running migrations...${NC}"
	docker exec -i yanga-postgres psql -U postgres yanga_db < db/schema.sql
	@echo "${GREEN}Migrations completed${NC}"

migrate-down: ## Rollback database migrations
	@echo "${RED}Rolling back migrations...${NC}"
	docker exec -i yanga-postgres psql -U postgres yanga_db < db/migrations/001_init_schema.down.sql

migrate-create: ## Create new migration (make migrate-create NAME=add_users_table)
	@echo "${BLUE}Creating migration: $(NAME)${NC}"
	@timestamp=$$(date +%Y%m%d%H%M%S); \
	touch db/migrations/$${timestamp}_$(NAME).up.sql; \
	touch db/migrations/$${timestamp}_$(NAME).down.sql; \
	echo "${GREEN}Created migration files in db/migrations/${NC}"

## SQLC
sqlc: ## Generate sqlc code for all services
	@echo "${BLUE}Generating sqlc code...${NC}"
	@for service in auth-service trip-service driver-service rating-service; do \
		echo "${GREEN}Generating sqlc for $$service${NC}"; \
		cd services/$$service && sqlc generate && cd ../..; \
	done
	@echo "${GREEN}SQLC generation completed${NC}"

sqlc-service: ## Generate sqlc for specific service (make sqlc-service SERVICE=auth-service)
	@echo "${BLUE}Generating sqlc for $(SERVICE)...${NC}"
	cd services/$(SERVICE) && sqlc generate

## Swagger
swagger: ## Generate swagger documentation
	@echo "${BLUE}Generating Swagger documentation...${NC}"
	@for service in $(SERVICES); do \
		echo "${GREEN}Generating swagger for $$service${NC}"; \
		cd services/$$service && swag init -g cmd/main.go -o docs && cd ../..; \
	done
	@echo "${GREEN}Swagger documentation generated${NC}"

swagger-service: ## Generate swagger for specific service
	@echo "${BLUE}Generating Swagger for $(SERVICE)...${NC}"
	cd services/$(SERVICE) && swag init -g cmd/main.go -o docs

## Linting & Formatting
fmt: ## Format code
	@echo "${BLUE}Formatting code...${NC}"
	gofmt -s -w .
	@echo "${GREEN}Code formatted${NC}"

lint: ## Run linter
	@echo "${BLUE}Running linter...${NC}"
	golangci-lint run ./...

vet: ## Run go vet
	@echo "${BLUE}Running go vet...${NC}"
	go vet ./...

## Tools Installation
install-tools: ## Install development tools
	@echo "${BLUE}Installing development tools...${NC}"
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
	go install github.com/swaggo/swag/cmd/swag@latest
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@echo "${GREEN}Tools installed successfully${NC}"

## Hot Reload
dev-auth: ## Run auth service with hot reload
	cd services/auth-service && air

dev-trip: ## Run trip service with hot reload
	cd services/trip-service && air

dev-driver: ## Run driver service with hot reload
	cd services/driver-service && air

dev-rating: ## Run rating service with hot reload
	cd services/rating-service && air

dev-gateway: ## Run gateway with hot reload
	cd api-gateway && air

## Project Setup
init: docker-up db-create migrate-up deps build ## Initialize project
	@echo "${GREEN}Project initialized successfully!${NC}"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Copy .env.example to .env and update values"
	@echo "  2. Run 'make run-all' to start all services"
	@echo "  3. Visit http://localhost:8080/swagger for API docs"

setup-env: ## Setup environment files
	@echo "${BLUE}Setting up environment files...${NC}"
	@for service in $(SERVICES); do \
		cp .env.example services/$$service/.env || true; \
	done
	@echo "${GREEN}Environment files created${NC}"

## Status
status: ## Show service status
	@echo "${BLUE}Service Status:${NC}"
	@ps aux | grep -E '(auth-service|trip-service|driver-service|rating-service|api-gateway)' | grep -v grep || echo "No services running"

ports: ## Show service ports
	@echo "${BLUE}Service Ports:${NC}"
	@echo "Auth Service:   8081"
	@echo "Trip Service:   8082"
	@echo "Driver Service: 8083"
	@echo "Rating Service: 8084"
	@echo "API Gateway:    8080"
	@echo "PostgreSQL:     5432"
	@echo "NATS:           4222"
	@echo "Adminer:        8081"
