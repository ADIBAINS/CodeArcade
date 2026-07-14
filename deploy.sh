#!/bin/bash
set -e

echo "CodeArcade - Production Deploy"
echo "=============================="

# Check if .env exists
if [ ! -f .env ]; then
  echo "No .env file found. Creating from template..."
  cat > .env <<EOF
POSTGRES_USER=codearcade
POSTGRES_PASSWORD=$(openssl rand -hex 16)
POSTGRES_DB=codearcade
JWT_SECRET=$(openssl rand -hex 32)
INTERNAL_JUDGE_TOKEN=$(openssl rand -hex 32)
ADMIN_EMAIL=admin@codearcade.local
ADMIN_PASSWORD=$(openssl rand -base64 16)
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF
  echo ".env created. Review and adjust values if needed."
fi

echo "Building and starting services..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "Waiting for API to be ready..."
sleep 5

for i in {1..30}; do
  if curl -sf http://localhost:4000/health > /dev/null 2>&1; then
    echo "API is ready!"
    break
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
echo "  Frontend:  http://localhost:3000"
echo "  API:       http://localhost:4000"
echo "  Database:  localhost:5432"
echo ""
echo "  Admin: admin@codearcade.local / admin123"
echo "=============================="
