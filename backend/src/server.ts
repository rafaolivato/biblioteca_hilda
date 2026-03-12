import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes.js';
import axios from 'axios';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// 1. CONFIGURAÇÕES (Middlewares) - Devem vir primeiro!
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json()); // Essencial para ler o corpo da requisição (JSON)

// 2. ROTAS - Devem vir depois dos middlewares
app.use('/auth', authRoutes);

app.get('/health', async (req, res) => {
  try {
    const count = await prisma.usuario.count();
    res.json({ status: "Online", usuarios_cadastrados: count });
  } catch (error) {
    res.status(500).json({ error: "Erro ao ligar à base de dados", detalhes: error });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando em http://localhost:${PORT}`);
});

app.get('/dashboard/stats', async (req, res) => {
  try {
    const [livros, alunos, emprestimos] = await Promise.all([
      prisma.livro.count(),
      prisma.usuario.count({ where: { role: 'ALUNO' } }), // Supondo que você use roles
      prisma.emprestimo.count({ where: { status: 'ATIVO' } })
    ]);

    res.json({ livros, alunos, emprestimos });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

app.get('/livros/buscar-isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  const cleanIsbn = isbn.replace(/\D/g, '');

  try {
    // Busca ESPECÍFICA por ISBN com API key
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
    );

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ 
        error: "Livro não encontrado.",
        isbn: cleanIsbn 
      });
    }

    const info = response.data.items[0].volumeInfo;
    
    // Retorna dados enriquecidos do livro
    res.json({
      isbn: cleanIsbn,
      titulo: info.title,
      autor: info.authors ? info.authors.join(', ') : 'Autor Desconhecido',
      editora: info.publisher || null,
      publicadoEm: info.publishedDate || null,
      descricao: info.description || null,
      paginas: info.pageCount || null,
      categoria: info.categories ? info.categories.join(', ') : null,
      idioma: info.language || null,
      capaUrl: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null,
      capaGrande: info.imageLinks?.medium || info.imageLinks?.large || null
    });

  } catch (error) {
    const err = error as Error;
    console.error('Erro na API do Google Books:', err.message);
    res.status(500).json({ 
      error: "Erro na conexão com o Google.",
      details: err.message 
    });
  }
});

app.post('/livros', async (req, res) => {
  const { isbn, titulo, autor, capaUrl } = req.body;

  // Validação básica
  if (!isbn || !titulo || !autor) {
    return res.status(400).json({ 
      error: "ISBN, título e autor são obrigatórios" 
    });
  }

  try {
    // Limpa o ISBN (remove traços e espaços)
    const cleanIsbn = isbn.replace(/\D/g, '');

    const livro = await prisma.livro.upsert({
      where: { isbn: cleanIsbn },
      update: { quantidade: { increment: 1 } },
      create: {
        isbn: cleanIsbn,
        titulo,
        autor,
        capaUrl,
        quantidade: 1
      }
    });

    const mensagem = livro.quantidade > 1 
      ? `Livro já existia. Estoque aumentado para ${livro.quantidade} exemplares.`
      : "Livro cadastrado com sucesso!";

    res.status(201).json({ livro, mensagem, isNovo: livro.quantidade === 1 });

  } catch (error: any) { // Usando any para simplificar
    console.error('Erro ao salvar livro:', error);
    
    // Verifica se é erro de unique constraint do Prisma
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: "Já existe um livro com este ISBN." 
      });
    }

    res.status(500).json({ 
      error: "Erro ao salvar o livro no banco de dados." 
    });
  }
});

// Buscar apenas alunos
app.get('/usuarios/alunos', async (req, res) => {
  try {
    const alunos = await prisma.usuario.findMany({ 
      where: { role: 'USER' },
      select: {
        id: true,
        nome: true,
        email: true,
        ra: true,
        createdAt: true
      }
    });
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar alunos." });
  }
});

// Criar novo usuário (Admin ou Aluno)
app.post('/usuarios', async (req, res) => {
  const { nome, email, ra, senha, role } = req.body;
  
  // Validação básica (apenas nome e RA são obrigatórios)
  if (!nome || !ra) {
    return res.status(400).json({ 
      error: "Nome e RA são obrigatórios" 
    });
  }

  try {
    const novo = await prisma.usuario.create({
      data: { 
        nome, 
        email: email || null, // Se não tiver email, salva como null
        ra,
        senha: senha || '123456', // Senha padrão se não fornecida
        role: role || 'USER' 
      },
      select: {
        id: true,
        nome: true,
        email: true,
        ra: true,
        role: true
      }
    });
    res.json(novo);
  } catch (e: any) {
    // Tratamento de erros específicos
    if (e.code === 'P2002') {
      const campo = e.meta?.target?.[0];
      if (campo === 'ra') {
        return res.status(400).json({ error: "RA já cadastrado" });
      }
      if (campo === 'email') {
        return res.status(400).json({ error: "E-mail já cadastrado" });
      }
    }
    res.status(400).json({ error: "Erro ao cadastrar usuário" });
  }
});

// Excluir usuário
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verifica se tem empréstimos ativos
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: { emprestimos: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (usuario.emprestimos.length > 0) {
      return res.status(400).json({ 
        error: "Não é possível excluir aluno com empréstimos" 
      });
    }

    await prisma.usuario.delete({ where: { id } });
    res.json({ message: "Usuário excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
});

app.get('/livros', async (req, res) => {
  try {
    const livros = await prisma.livro.findMany({
      orderBy: { titulo: 'asc' } // Organiza por ordem alfabética
    });
    res.json(livros);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar acervo." });
  }
});

app.post('/emprestimos', async (req, res) => {
  const { usuarioId, livroId } = req.body;

  try {
    const resultado = await prisma.$transaction([
      // 1. Cria o registro de empréstimo
      prisma.emprestimo.create({
        data: {
          usuarioId,
          livroId,

        }
      }),
      // 2. Diminui a quantidade disponível do livro
      prisma.livro.update({
        where: { id: livroId },
        data: { quantidade: { decrement: 1 } }
      })
    ]);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao realizar empréstimo." });
  }
});

app.get('/emprestimos/ativos', async (req, res) => {
  try {
    const ativos = await prisma.emprestimo.findMany({
      where: { dataDevolucao: null }, // Ou status: 'ATIVO', conforme seu schema
      include: {
        usuario: true, // Traz os dados do aluno
        livro: true    // Traz os dados do livro
      }
    });
    res.json(ativos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar empréstimos." });
  }
});

app.put('/emprestimos/devolver/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const emprestimo = await prisma.emprestimo.findUnique({ where: { id } });

    if (!emprestimo) return res.status(404).json({ error: "Empréstimo não encontrado" });

    await prisma.$transaction([
      prisma.emprestimo.update({
        where: { id },
        data: { dataDevolucao: new Date(), status: 'DEVOLVIDO' }
      }),
      prisma.livro.update({
        where: { id: emprestimo.livroId },
        data: { quantidade: { increment: 1 } }
      })
    ]);

    res.json({ message: "Livro devolvido com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao processar devolução." });
  }
});