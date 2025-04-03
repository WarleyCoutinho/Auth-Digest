#!/bin/bash

# Function to display help message
show_help() {
  echo "Usage: ./docker.sh [command]"
  echo ""
  echo "Commands:"
  echo "  dev          Start development environment"
  echo "  prod         Start production environment"
  echo "  down         Stop all containers"
  echo "  logs [dev|prod]   Show logs for development or production containers"
  echo "  build [dev|prod]  Build development or production images"
  echo "  restart [dev|prod] Restart development or production containers"
  echo "  prisma-studio     Run Prisma Studio in development environment"
  echo "  help         Show this help message"
}

# Development environment
start_dev() {
  echo "Starting development environment..."
  docker-compose up -d api-dev postgres
  echo "Development API running at http://localhost:3000"
  echo "Development API Swagger docs available at http://localhost:3000/docs"
}

# Production environment
start_prod() {
  echo "Starting production environment..."
  docker-compose -f docker-compose.prod.yml up -d
  echo "Production API running at http://localhost:${API_PORT:-3000}"
}

# Stop all containers
stop_containers() {
  echo "Stopping all containers..."
  docker-compose down
  docker-compose -f docker-compose.prod.yml down
}

# Show logs
show_logs() {
  if [ "$1" == "dev" ]; then
    docker-compose logs -f api-dev
  elif [ "$1" == "prod" ]; then
    docker-compose -f docker-compose.prod.yml logs -f api
  else
    echo "Please specify 'dev' or 'prod'"
    exit 1
  fi
}

# Build images
build_images() {
  if [ "$1" == "dev" ]; then
    docker-compose build api-dev
  elif [ "$1" == "prod" ]; then
    docker-compose -f docker-compose.prod.yml build api
  else
    echo "Please specify 'dev' or 'prod'"
    exit 1
  fi
}

# Restart containers
restart_containers() {
  if [ "$1" == "dev" ]; then
    docker-compose restart api-dev
  elif [ "$1" == "prod" ]; then
    docker-compose -f docker-compose.prod.yml restart api
  else
    echo "Please specify 'dev' or 'prod'"
    exit 1
  fi
}

# Run Prisma Studio in development environment
run_prisma_studio() {
  echo "Starting Prisma Studio in development environment..."
  docker-compose exec api-dev npx prisma studio
  echo "Prisma Studio running at http://localhost:5555"
}

# Main function
main() {
  case "$1" in
    dev)
      start_dev
      ;;
    prod)
      start_prod
      ;;
    down)
      stop_containers
      ;;
    logs)
      show_logs "$2"
      ;;
    build)
      build_images "$2"
      ;;
    restart)
      restart_containers "$2"
      ;;
    prisma-studio)
      run_prisma_studio
      ;;
    help|*)
      show_help
      ;;
  esac
}

# Execute main function with all arguments
main "$@"