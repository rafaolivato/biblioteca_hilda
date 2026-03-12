// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar admin
  const senhaHashAdmin = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@biblioteca.com' },
    update: {},
    create: {
      nome: 'Rafael Administrador',
      email: 'admin@biblioteca.com',
      senha: senhaHashAdmin,
      role: 'ADMIN',
      
    },
  });
  console.log('✅ Admin criado: admin@biblioteca.com / admin123');

  // Criar alunos de exemplo
  const senhaHashAluno = await bcrypt.hash('aluno123', 10);
  
  
  console.log('🎉 Seed concluído com sucesso!');
}

// Executar o seed
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
  });