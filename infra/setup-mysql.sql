-- =============================================
-- ClinicFlow — Setup MySQL Servidor Dedicado
-- Executar como root no servidor 192.168.10.141
-- =============================================

-- Criar databases
CREATE DATABASE IF NOT EXISTS clinicflow     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS clinicflow_n8n CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS evolution      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário dedicado (substitua a senha!)
CREATE USER IF NOT EXISTS 'clinicflow_user'@'%' IDENTIFIED BY 'TROCAR_SENHA_AQUI';

-- Conceder permissões
GRANT ALL PRIVILEGES ON clinicflow.*     TO 'clinicflow_user'@'%';
GRANT ALL PRIVILEGES ON clinicflow_n8n.* TO 'clinicflow_user'@'%';
GRANT ALL PRIVILEGES ON evolution.*      TO 'clinicflow_user'@'%';

FLUSH PRIVILEGES;

-- Verificar
SELECT user, host FROM mysql.user WHERE user = 'clinicflow_user';
SHOW DATABASES LIKE 'clinicflow%';
SHOW DATABASES LIKE 'evolution';
