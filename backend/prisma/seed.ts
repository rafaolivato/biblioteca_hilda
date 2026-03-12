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
      matricula: 'ADM001'
    },
  });
  console.log('✅ Admin criado: admin@biblioteca.com / admin123');

  // Criar alunos de exemplo
  const senhaHashAluno = await bcrypt.hash('aluno123', 10);
  
  const alunos = await Promise.all([
    prisma.usuario.upsert({
      where: { email: 'joao.silva@email.com' },
      update: {},
      create: {
        nome: 'João Silva',
        email: 'joao.silva@email.com',
        senha: senhaHashAluno,
        role: 'ALUNO',
        matricula: '2024001'
      }
    }),
    prisma.usuario.upsert({
      where: { email: 'maria.santos@email.com' },
      update: {},
      create: {
        nome: 'Maria Santos',
        email: 'maria.santos@email.com',
        senha: senhaHashAluno,
        role: 'ALUNO',
        matricula: '2024002'
      }
    }),
    prisma.usuario.upsert({
      where: { email: 'pedro.oliveira@email.com' },
      update: {},
      create: {
        nome: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        senha: senhaHashAluno,
        role: 'ALUNO',
        matricula: '2024003'
      }
    })
  ]);

  console.log(`✅ ${alunos.length} alunos criados (senha: aluno123)`);

  // Criar livros de exemplo
  const livros = await Promise.all([
    prisma.livro.upsert({
      where: { isbn: '9788535914849' },
      update: {},
      create: {
        titulo: 'O Alquimista',
        autor: 'Paulo Coelho',
        isbn: '9788535914849',
        anoPublicacao: 1988,
        quantidade: 5
      }
    }),
    prisma.livro.upsert({
      where: { isbn: '9788544002129' },
      update: {},
      create: {
        titulo: 'A Revolução dos Bichos',
        autor: 'George Orwell',
        isbn: '9788544002129',
        anoPublicacao: 1945,
        quantidade: 3
      }
    }),
    prisma.livro.upsert({
      where: { isbn: '9788532510101' },
      update: {},
      create: {
        titulo: 'O Pequeno Príncipe',
        autor: 'Antoine de Saint-Exupéry',
        isbn: '9788532510101',
        anoPublicacao: 1943,
        quantidade: 4
      }
    })
  ]);

  console.log(`✅ ${livros.length} livros criados`);

  // Criar empréstimos de exemplo
  if (alunos.length > 0 && livros.length > 0) {
    await prisma.emprestimo.create({
      data: {
        usuarioId: alunos[0].id,
        livroId: livros[0].id,
        status: 'ATIVO',
        dataDevolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    console.log('✅ Empréstimo ativo criado');
  }

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