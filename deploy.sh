#!/bin/bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "CodeArcade - Production Deploy"
echo "=============================="

# Check if .env exists
if [ ! -f .env ]; then
  echo "No .env file found. Creating from template..."
  cat >.env <<EOF
POSTGRES_USER=codearcade
POSTGRES_PASSWORD=$(openssl rand -hex 16)
POSTGRES_DB=codearcade
JWT_SECRET=$(openssl rand -hex 32)
INTERNAL_JUDGE_TOKEN=$(openssl rand -hex 32)
ADMIN_EMAIL=admin@codearcade.local
ADMIN_PASSWORD=$(openssl rand -base64 16)
CORS_ORIGIN=http://codearcade.adibains.xyz
# Leave this empty when Nginx serves the web app and API from the same domain.
NEXT_PUBLIC_API_URL=
JUDGE_DOCKER_WORKSPACE_ROOT=$PROJECT_DIR/judge-workspaces
API_HOST_PORT=4000
WEB_HOST_PORT=3000
NGINX_HOST_PORT=8080
EOF
  echo ".env created. Review and adjust values if needed."
fi

mkdir -p "${JUDGE_DOCKER_WORKSPACE_ROOT:-$PROJECT_DIR/judge-workspaces}"

echo "Building and starting services..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "Waiting for API to be ready..."
sleep 5

for i in {1..60}; do
  if curl -sf "http://127.0.0.1:${API_HOST_PORT:-4000}/health" >/dev/null 2>&1; then
    echo "Application is ready!"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Deployment failed: Nginx/API did not become healthy."
    docker compose -f docker-compose.prod.yml ps
    docker compose -f docker-compose.prod.yml logs --tail=100 nginx api web
    exit 1
  fi
  sleep 1
done

echo ""
echo "Seeding database..."
docker compose -f docker-compose.prod.yml exec -T api npx prisma db seed || true

echo ""
echo "=============================="
echo "CodeArcade is running!"
echo ""
echo "  Frontend:  ${CORS_ORIGIN:-https://codearcade.adibains.xyz}"
echo "  API:       ${CORS_ORIGIN:-https://codearcade.adibains.xyz}/api"
echo "  Database:  private Docker network only"
echo ""
echo "  Admin: ${ADMIN_EMAIL:-admin@codearcade.local} (password is set in .env)"
echo "=============================="
