#!/bin/bash
# ══════════════════════════════════════════════════════
# ClinicFlow — Script de Deploy
# Executar em /opt/clinicflow na VM
# ══════════════════════════════════════════════════════

set -e

PROJECT_DIR="/opt/clinicflow"
COMPOSE_FILE="$PROJECT_DIR/infra/docker-compose.prod.yml"
ENV_FILE="$PROJECT_DIR/infra/.env.production"

echo "🚀 Iniciando deploy do ClinicFlow..."
echo "──────────────────────────────────────"

# ── Verificar .env.production ──────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Arquivo $ENV_FILE não encontrado!"
  echo "   Copie: cp infra/.env.production.example infra/.env.production"
  exit 1
fi

cd "$PROJECT_DIR"

# ── Atualizar código ───────────────────────────────────
echo "📥 Atualizando código..."
git pull origin main

# ── Build containers ───────────────────────────────────
echo "🐳 Fazendo build dos containers..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache

# ── Rodar migrations dentro do container ───────────────
echo "🗄️  Rodando migrations..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm api \
  npx prisma migrate deploy

# ── Subir todos os containers ──────────────────────────
echo "🐳 Subindo containers..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# ── Verificar saúde dos containers ────────────────────
echo "⏳ Aguardando containers iniciarem..."
sleep 10

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo ""
echo "✅ Deploy concluído!"
echo "══════════════════════════════════════════════"
# Ler DOMAIN do .env.production
DOMAIN=$(grep '^DOMAIN=' "$ENV_FILE" | cut -d'=' -f2)
echo "  🌐 App:     https://app.$DOMAIN"
echo "  🔌 API:     https://api.$DOMAIN"
echo "  📦 MinIO:   https://minio.$DOMAIN"
echo "  ⚙️  Traefik: https://traefik.$DOMAIN"
echo "══════════════════════════════════════════════"
