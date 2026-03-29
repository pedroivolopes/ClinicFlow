# ClinicFlow

Sistema completo de gestão de clínicas médicas.

## Stack
- **Frontend**: Next.js 14 + TailwindCSS + ShadCN
- **Backend**: Fastify + Prisma + TypeScript
- **Banco**: MySQL 8 (servidor dedicado externo)
- **Cache/Filas**: Redis + BullMQ
- **WhatsApp**: Evolution API + n8n
- **Storage**: MinIO

## Hierarquia de Roles
| Role | Descrição |
|------|-----------|
| SUPER_ADMIN | RothaDigital — acesso total |
| ADMIN | Admin da clínica |
| MEDICO | Agenda, pacientes, exames, WhatsApp |
| FINANCEIRO | Financeiro, pacientes, exames, WhatsApp |
| ATENDENTE | Agenda, pacientes, exames, WhatsApp |

## Setup — Semana 1

### 1. Banco MySQL (servidor dedicado)
```sql
CREATE DATABASE clinicflow     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE clinicflow_n8n CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE evolution      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'clinicflow_user'@'%' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON clinicflow.*     TO 'clinicflow_user'@'%';
GRANT ALL PRIVILEGES ON clinicflow_n8n.* TO 'clinicflow_user'@'%';
GRANT ALL PRIVILEGES ON evolution.*      TO 'clinicflow_user'@'%';
FLUSH PRIVILEGES;
```

### 2. Variáveis de ambiente
```bash
cp apps/api/.env.example apps/api/.env
cp infra/.env.example infra/.env
# editar os dois arquivos com seus dados
```

### 3. Subir infra Docker
```bash
cd infra
docker compose up -d
```

### 4. Instalar dependências e rodar migrations
```bash
pnpm install
cd apps/api
pnpm db:migrate
pnpm db:seed    # cria usuários de teste
```

### 5. Iniciar em dev
```bash
# na raiz do projeto
pnpm dev
```

## Credenciais de teste (após seed)
| Usuário | Email | Senha |
|---------|-------|-------|
| Super Admin | admin@rothadigital.com.br | RothaDigital@2026 |
| Admin | admin@saulucas.com.br | Admin@2026 |
| Médico | dr.carlos@saulucas.com.br | Medico@2026 |
| Atendente | recepcao@saulucas.com.br | Recepcao@2026 |
| Financeiro | financeiro@saulucas.com.br | Financeiro@2026 |
