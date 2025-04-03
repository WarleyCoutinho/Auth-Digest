# Docker Setup for API-Rancheiro

This document explains how to use Docker to run the API-Rancheiro application in both development and production environments.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

## Quick Start

1. Clone the repository and navigate to the project directory
2. Copy the `.env.example` file to `.env` and adjust the values if needed:
   ```bash
   cp .env.example .env
   ```
3. Give execution permission to the docker script:
   ```bash
   chmod +x docker.sh
   ```
4. Start the development environment:
   ```bash
   ./docker.sh dev
   ```

## Environment Setup

### Development Environment

To start the development environment:

```bash
./docker.sh dev
```

This will:
- Start a PostgreSQL database container
- Start the API in development mode with hot-reloading
- Run Prisma migrations automatically
- Make the API available at http://localhost:3000
- Make Swagger documentation available at http://localhost:3000/docs

### Production Environment

To start the production environment:

```bash
./docker.sh prod
```

This will:
- Start a PostgreSQL database container
- Start the API in production mode with optimized settings
- Run Prisma migrations automatically
- Make the API available at http://localhost:3010 (configurable via API_PORT in .env)

## Docker Script Commands

The `docker.sh` script provides several commands to manage your Docker environments:

- `./docker.sh dev`: Start development environment
- `./docker.sh prod`: Start production environment
- `./docker.sh down`: Stop all containers
- `./docker.sh logs dev`: Show logs for development containers
- `./docker.sh logs prod`: Show logs for production containers
- `./docker.sh build dev`: Build development images
- `./docker.sh build prod`: Build production images
- `./docker.sh restart dev`: Restart development containers
- `./docker.sh restart prod`: Restart production containers
- `./docker.sh prisma-studio`: Run Prisma Studio in development environment
- `./docker.sh help`: Show help message

## Production Deployment

For a production deployment, it's recommended to:

1. Create a `.env.production` file with secure settings
2. Use the production-specific docker-compose file:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Production Environment Variables

For production, you should set these environment variables in your `.env` file:

```
DB_USER=your_db_user
DB_PASSWORD=strong_secure_password
DB_NAME=api_rancheiro
DB_PORT=5432
API_PORT=3000
JWT_SECRET=very_secure_random_string
LOG_LEVEL=info
```

## Data Persistence

- Database data is stored in a Docker volume named `postgres_data`
- Image files uploaded to the API are stored in a Docker volume named `images_data` in production

## Accessing Database

To access the PostgreSQL database directly:

```bash
docker exec -it api-rancheiro-postgres psql -U postgres -d api_rancheiro
```

## Troubleshooting

If you encounter any issues, try these steps:

1. Check the logs:
   ```bash
   ./docker.sh logs dev
   # or
   ./docker.sh logs prod
   ```

2. Restart the containers:
   ```bash
   ./docker.sh restart dev
   # or
   ./docker.sh restart prod
   ```

3. Rebuild the images:
   ```bash
   ./docker.sh build dev
   # or
   ./docker.sh build prod
   ```

4. If all else fails, stop everything and start from scratch:
   ```bash
   ./docker.sh down
   ./docker.sh dev  # or prod
   ```