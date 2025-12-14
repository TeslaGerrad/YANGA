# Yanga Rides - Microservices Backend

A production-ready, event-driven microservices backend for a ride-sharing application built with Go, PostgreSQL, NATS, and following clean architecture principles.

## 🏗️ Architecture Overview

This project follows a microservices architecture with the following services:

```
┌─────────────────┐
│   API Gateway   │ :8080
└────────┬────────┘
         │
    ┌────┴──────────────────────┬──────────────┬────────────────┐
    │                           │              │                │
┌───▼────────┐  ┌──────▼────────┐  ┌──────▼───────┐  ┌─────▼──────────┐
│   Auth     │  │     Trip      │  │   Driver     │  │    Rating      │
│  Service   │  │   Service     │  │   Service    │  │   Service      │
│   :8081    │  │    :8082      │  │    :8083     │  │    :8084       │
└─────┬──────┘  └───────┬───────┘  └──────┬───────┘  └────────┬───────┘
      │                 │                  │                   │
      │                 └──────────┬───────┴───────────────────┘
      │                            │
      │                     ┌──────▼───────┐
      │                     │     NATS     │ Event Bus
      │                     │    :4222     │
      │                     └──────────────┘
      │
      └────────────────────┬────────────────────────────────────┘
                           │
                    ┌──────▼──────┐       ┌──────────┐
                    │  PostgreSQL │       │  Redis   │
                    │    :5432    │       │  :6379   │
                    └─────────────┘       └──────────┘
```

### Services

1. **Auth Service** (Port 8081)
   - User registration and authentication
   - JWT token generation
   - Password reset functionality
   - Publishes: `user.created` events

2. **Trip Service** (Port 8082)
   - Trip creation and management
   - Fare calculation
   - Available driver discovery
   - Publishes: `trip.created`, `trip.cancelled` events
   - Subscribes: `trip.accepted`, `trip.completed`

3. **Driver Service** (Port 8083)
   - Driver profile management
   - Online/offline status
   - Location tracking
   - Trip acceptance and management
   - Publishes: `driver.online`, `driver.offline`, `driver.location`, `trip.accepted`, `trip.started`, `trip.completed`
   - Subscribes: `trip.created`

4. **Rating Service** (Port 8084)
   - User and driver ratings
   - Feedback management
   - Average rating calculation
   - Publishes: `rating.created`
   - Subscribes: `trip.completed`

5. **API Gateway** (Port 8080)
   - Single entry point for all clients
   - Request routing
   - Load balancing
   - Rate limiting
   - Swagger documentation aggregation

### Shared Library

The `shared-lib` contains common code used across all services:
- Domain models and DTOs
- Middleware (Auth, CORS, Logging, Casbin)
- Utilities (JWT, Password hashing, Geo calculations)
- Database connection pooling
- Event bus implementation
- Configuration management

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- Docker & Docker Compose
- Make
- sqlc
- swag (Swagger)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd yanga-services
```

2. **Install development tools**
```bash
make install-tools
```

3. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start infrastructure**
```bash
make docker-up
```

5. **Initialize database**
```bash
make migrate-up
```

6. **Generate sqlc code**
```bash
make sqlc
```

7. **Generate Swagger docs**
```bash
make swagger
```

8. **Build services**
```bash
make build
```

9. **Run all services**
```bash
make run-all
```

Or run individual services:
```bash
make run-auth      # Auth service
make run-trip      # Trip service
make run-driver    # Driver service
make run-rating    # Rating service
make run-gateway   # API Gateway
```

## 📚 Documentation

### API Documentation

Once services are running, access Swagger documentation:

- **API Gateway**: http://localhost:8080/swagger
- **Auth Service**: http://localhost:8081/swagger
- **Trip Service**: http://localhost:8082/swagger
- **Driver Service**: http://localhost:8083/swagger
- **Rating Service**: http://localhost:8084/swagger

### Database

- **PostgreSQL**: localhost:5432
- **Adminer** (DB GUI): http://localhost:8090
- **Credentials**: postgres/postgres

### Message Queue

- **NATS**: localhost:4222
- **NATS Monitor**: http://localhost:8222

## 🛠️ Development

### Hot Reload

Use Air for hot reloading during development:

```bash
make dev-auth      # Auth service with hot reload
make dev-trip      # Trip service with hot reload
make dev-driver    # Driver service with hot reload
make dev-rating    # Rating service with hot reload
make dev-gateway   # API Gateway with hot reload
```

### Running Tests

```bash
make test              # Run all tests
make test-service SERVICE=auth-service  # Test specific service
```

### Database Operations

```bash
make db-dump       # Create database dump
make db-restore    # Restore from dump
make db-reset      # Drop and recreate database
make migrate-create NAME=add_feature  # Create new migration
```

### Code Quality

```bash
make fmt           # Format code
make lint          # Run linter
make vet           # Run go vet
```

## 📋 Make Commands

```bash
make help          # Show all available commands
make init          # Initialize entire project
make build         # Build all services
make run-all       # Run all services
make test          # Run tests
make clean         # Clean build artifacts
make docker-up     # Start Docker containers
make docker-down   # Stop Docker containers
make sqlc          # Generate sqlc code
make swagger       # Generate Swagger docs
```

## 🏗️ Project Structure

```
yanga-services/
├── api-gateway/              # API Gateway service
│   ├── cmd/
│   │   └── main.go
│   ├── internal/
│   └── go.mod
├── services/
│   ├── auth-service/         # Authentication service
│   │   ├── cmd/
│   │   ├── internal/
│   │   │   ├── db/          # Generated sqlc code
│   │   │   ├── handler/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   ├── docs/            # Swagger docs
│   │   ├── sqlc.yaml
│   │   └── go.mod
│   ├── trip-service/         # Trip management service
│   ├── driver-service/       # Driver management service
│   └── rating-service/       # Rating service
├── shared-lib/               # Shared library
│   ├── config/              # Configuration
│   ├── database/            # DB connection
│   ├── domain/              # Domain models
│   ├── events/              # Event definitions
│   ├── middleware/          # HTTP middleware
│   ├── utils/               # Utilities
│   └── go.mod
├── db/
│   ├── schema.sql           # pg_dump schema
│   ├── queries/             # SQL queries for sqlc
│   │   ├── users.sql
│   │   ├── drivers.sql
│   │   ├── trips.sql
│   │   └── ratings.sql
│   └── migrations/          # Database migrations
├── config/
│   └── routes/              # Route configurations
├── casbin/                  # Casbin RBAC policies
│   ├── model.conf
│   └── policy.csv
├── docker-compose.yml       # Docker services
├── Makefile                 # Build automation
└── README.md
```

## 🔧 Configuration

### Environment Variables

Each service uses these common environment variables:

```env
# Service
SERVICE_HOST=0.0.0.0
SERVICE_PORT=8081  # Different per service

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=yanga_db
DB_SSLMODE=disable

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY_HOURS=24

# NATS
NATS_URL=nats://localhost:4222

# Twilio (Optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## 🔐 Security

- **Authentication**: JWT-based authentication
- **Authorization**: Casbin RBAC
- **Password Hashing**: bcrypt
- **SQL Injection Prevention**: sqlc with prepared statements
- **CORS**: Configurable CORS middleware

## 📊 Event-Driven Architecture

### Event Flow Examples

**Trip Creation Flow:**
```
1. User creates trip → Trip Service
2. Trip Service publishes "trip.created" event
3. Driver Service receives event → Notifies nearby drivers
4. Driver accepts → Driver Service publishes "trip.accepted"
5. Trip Service receives event → Updates trip status
```

**Rating Flow:**
```
1. Trip completed → Driver/Trip Service publishes "trip.completed"
2. Rating Service receives event → Enables rating
3. User/Driver submits rating → Rating Service
4. Rating Service publishes "rating.created"
5. Driver Service receives event → Updates driver rating
```

## 🧪 Testing

The project includes:
- Unit tests for business logic
- Integration tests for repositories
- API tests for handlers
- Event tests for pub/sub

Run specific test suites:
```bash
go test ./services/auth-service/internal/service/... -v
go test ./shared-lib/... -v
```

## 📈 Monitoring & Observability

Recommended additions:
- Prometheus for metrics
- Grafana for visualization
- Jaeger for distributed tracing
- ELK stack for log aggregation

## 🚢 Deployment

### Docker Build

```bash
# Build individual service
docker build -f services/auth-service/Dockerfile -t yanga-auth:latest .

# Build all services
docker-compose build
```

### Kubernetes

Helm charts and Kubernetes manifests coming soon.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `make test`
4. Format code: `make fmt`
5. Submit a pull request

## 📝 License

MIT License

## 👥 Authors

Yanga Development Team

## 🔗 Links

- [API Documentation](http://localhost:8080/swagger)
- [NATS Documentation](https://docs.nats.io/)
- [sqlc Documentation](https://docs.sqlc.dev/)
- [Casbin Documentation](https://casbin.org/)

---

**Built with ❤️ using Go, PostgreSQL, NATS, and Clean Architecture**
