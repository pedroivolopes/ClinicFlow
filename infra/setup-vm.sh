#!/bin/bash
# ══════════════════════════════════════════════════════
# ClinicFlow — Setup VM Ubuntu 22.04
# Executar como root na VM recém-criada
# ══════════════════════════════════════════════════════

set -e

echo "🚀 Iniciando setup da VM ClinicFlow..."

# ── Atualizar sistema ──────────────────────────────────
apt update && apt upgrade -y

# ── Instalar dependências ──────────────────────────────
apt install -y \
  curl wget git nano ufw \
  ca-certificates gnupg \
  apache2-utils          # para gerar senha do Traefik dashboard

# ── Instalar Docker ────────────────────────────────────
echo "📦 Instalando Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# ── Docker sem sudo ────────────────────────────────────
usermod -aG docker $SUDO_USER 2>/dev/null || true
systemctl enable docker
systemctl start docker

# ── Instalar Node.js 20 (para migrations em produção) ──
echo "📦 Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# ── Firewall ───────────────────────────────────────────
echo "🔒 Configurando firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ── Clonar repositório ─────────────────────────────────
echo "📁 Preparando diretório do projeto..."
mkdir -p /opt/clinicflow
cd /opt/clinicflow

echo ""
echo "✅ Setup concluído!"
echo "══════════════════════════════════════════════"
echo "Próximos passos:"
echo "  1. git clone <seu-repo> /opt/clinicflow"
echo "  2. cp infra/.env.production.example infra/.env.production"
echo "  3. Editar infra/.env.production com as senhas"
echo "  4. bash infra/deploy.sh"
echo "══════════════════════════════════════════════"
