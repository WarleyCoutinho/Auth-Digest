// scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin padrão
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashSync('admin123', 10),
      fullName: 'Administrador',
      email: 'admin@example.com',
      role: 'admin'
    }
  });

  console.log('Usuário admin criado:', adminUser);

  // Criar dispositivo de exemplo
  const device = await prisma.device.upsert({
    where: { name: 'Porta Principal' },
    update: {},
    create: {
      name: 'Porta Principal',
      ip: '192.168.1.100',
      username: 'admin',
      password: 'admin123'
    }
  });

  console.log('Dispositivo de exemplo criado:', device);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Use o script com: npx ts-node scripts/seed.ts

// scripts/setup.sh
#!/bin/bash

echo "Configurando o ambiente de desenvolvimento..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js não encontrado. Por favor, instale o Node.js."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "npm não encontrado. Por favor, instale o npm."
    exit 1
fi

# Instalar dependências
echo "Instalando dependências..."
npm install

# Configurar Prisma
echo "Gerando cliente Prisma..."
npx prisma generate

# Verificar se o .env existe
if [ ! -f .env ]; then
    echo "Criando arquivo .env a partir do exemplo..."
    cp .env.example .env
    echo "Arquivo .env criado. Por favor, configure-o com suas credenciais."
fi

# Criar pastas necessárias
echo "Criando diretórios necessários..."
mkdir -p images
mkdir -p logs

echo "Configuração concluída! Execute 'npm run dev' para iniciar o servidor."