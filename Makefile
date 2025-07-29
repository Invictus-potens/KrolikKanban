.PHONY: help install dev build start stop clean deploy-staging deploy-production

# Default target
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development
install: ## Install dependencies
	npm install --legacy-peer-deps

lockfile: ## Generate package-lock.json
	@echo "Generating package-lock.json..."
	@if [ -f "package-lock.json" ]; then \
		rm package-lock.json; \
	fi
	npm install --legacy-peer-deps
	@echo "✅ package-lock.json generated successfully!"

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

# Type checking and linting
type-check: ## Run TypeScript type checking
	npm run type-check

lint: ## Run ESLint
	npm run lint

lint-fix: ## Fix ESLint issues
	npm run lint -- --fix

# Testing
test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm test -- --watch

# Database
db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	# Add your migration commands here

db-seed: ## Seed database
	@echo "Seeding database..."
	# Add your seed commands here

# Environment setup
setup: ## Setup development environment
	@echo "Setting up development environment..."
	npm install --legacy-peer-deps
	@echo "✅ Setup complete!"

# Production build
prod-build: ## Build for production
	@echo "Building for production..."
	npm run build
	@echo "✅ Production build complete!"

# All-in-one commands
dev-all: setup dev ## Setup and start development
	@echo "Development environment ready!"

prod-all: setup install build ## Setup, install, build, and deploy
	@echo "Production deployment ready!"