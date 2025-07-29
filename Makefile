.PHONY: help install dev build start stop clean docker-build docker-run docker-stop docker-clean deploy-staging deploy-production

# Default target
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development
install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm start

stop: ## Stop development server
	@echo "Stopping development server..."
	@pkill -f "next dev" || true

clean: ## Clean build artifacts
	rm -rf .next
	rm -rf node_modules
	rm -rf dist

# Docker commands
docker-build: ## Build Docker image
	docker build -t krolikkanban .

docker-run: ## Run Docker container
	docker run -d \
		--name krolikkanban \
		-p 3000:3000 \
		-e NEXT_PUBLIC_SUPABASE_URL=$(NEXT_PUBLIC_SUPABASE_URL) \
		-e NEXT_PUBLIC_SUPABASE_ANON_KEY=$(NEXT_PUBLIC_SUPABASE_ANON_KEY) \
		krolikkanban

docker-stop: ## Stop Docker container
	docker stop krolikkanban || true
	docker rm krolikkanban || true

docker-clean: ## Clean Docker images
	docker rmi krolikkanban || true
	docker system prune -f

# Docker Compose commands
compose-up: ## Start with Docker Compose
	docker-compose up -d

compose-down: ## Stop Docker Compose
	docker-compose down

compose-build: ## Build and start with Docker Compose
	docker-compose up --build -d

compose-logs: ## View Docker Compose logs
	docker-compose logs -f

# Development with Docker Compose
dev-up: ## Start development environment
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down

dev-build: ## Build development environment
	docker-compose -f docker-compose.dev.yml up --build -d

dev-logs: ## View development logs
	docker-compose -f docker-compose.dev.yml logs -f

# Deployment
deploy-staging: ## Deploy to staging
	@echo "Deploying to staging..."
	@if [ -z "$(STAGING_HOST)" ]; then \
		echo "Error: STAGING_HOST not set"; \
		exit 1; \
	fi
	rsync -avz --exclude node_modules --exclude .next --exclude .git . $(STAGING_HOST):/var/www/krolikkanban/
	ssh $(STAGING_HOST) "cd /var/www/krolikkanban && docker-compose up --build -d"

deploy-production: ## Deploy to production
	@echo "Deploying to production..."
	@if [ -z "$(PRODUCTION_HOST)" ]; then \
		echo "Error: PRODUCTION_HOST not set"; \
		exit 1; \
	fi
	rsync -avz --exclude node_modules --exclude .next --exclude .git . $(PRODUCTION_HOST):/var/www/krolikkanban/
	ssh $(PRODUCTION_HOST) "cd /var/www/krolikkanban && docker-compose up --build -d"

# Database
db-setup: ## Setup database schema
	@echo "Setting up database schema..."
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "Error: DATABASE_URL not set"; \
		exit 1; \
	fi
	psql $(DATABASE_URL) -f supabaseSchema.sql

db-reset: ## Reset database
	@echo "Resetting database..."
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "Error: DATABASE_URL not set"; \
		exit 1; \
	fi
	psql $(DATABASE_URL) -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	psql $(DATABASE_URL) -f supabaseSchema.sql

# Testing
test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

lint: ## Run linter
	npm run lint

lint-fix: ## Fix linting issues
	npm run lint:fix

# Utilities
logs: ## View application logs
	tail -f logs/app.log

backup: ## Create database backup
	@echo "Creating database backup..."
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "Error: DATABASE_URL not set"; \
		exit 1; \
	fi
	pg_dump $(DATABASE_URL) > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore: ## Restore database from backup
	@echo "Restoring database from backup..."
	@if [ -z "$(DATABASE_URL)" ] || [ -z "$(BACKUP_FILE)" ]; then \
		echo "Error: DATABASE_URL or BACKUP_FILE not set"; \
		exit 1; \
	fi
	psql $(DATABASE_URL) < $(BACKUP_FILE)

# Monitoring
status: ## Check application status
	@echo "Application Status:"
	@echo "=================="
	@echo "Node.js version: $(shell node --version)"
	@echo "NPM version: $(shell npm --version)"
	@echo "Docker version: $(shell docker --version 2>/dev/null || echo 'Not installed')"
	@echo "Docker Compose version: $(shell docker-compose --version 2>/dev/null || echo 'Not installed')"
	@echo ""
	@echo "Running containers:"
	@docker ps --filter "name=krolikkanban" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No containers running"

health: ## Health check
	@echo "Performing health check..."
	@curl -f http://localhost:3000/api/health || echo "Application is not responding"

# Setup
setup: ## Initial setup
	@echo "Setting up KrolikKanban..."
	@if [ ! -f .env ]; then \
		cp env.example .env; \
		echo "Created .env file. Please edit it with your configuration."; \
	fi
	@npm install
	@echo "Setup complete!"

# Documentation
docs: ## Generate documentation
	@echo "Generating documentation..."
	@mkdir -p docs
	@echo "# KrolikKanban Documentation" > docs/README.md
	@echo "" >> docs/README.md
	@echo "Generated on $(shell date)" >> docs/README.md
	@echo "Documentation generated in docs/"

# All-in-one commands
all: setup install build ## Setup, install, and build
	@echo "All done!"

dev-all: setup install dev-up ## Setup, install, and start development environment
	@echo "Development environment ready!"

prod-all: setup install build docker-build docker-run ## Setup, install, build, and deploy
	@echo "Production deployment ready!"