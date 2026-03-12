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
  console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
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
  const cleanIsbn = isbn.replace(/\D/g, ''); // Remove traços e espaços

  try {
    // Busca mais flexível no Google Books
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${cleanIsbn}+isbn:${cleanIsbn}`
    );

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    const info = response.data.items[0].volumeInfo;
    res.json({
      isbn: cleanIsbn,
      titulo: info.title,
      autor: info.authors ? info.authors.join(', ') : 'Autor Desconhecido',
      capaUrl: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro na conexão com o Google." });
  }
});

app.post('/livros', async (req, res) => {
  const { isbn, titulo, autor, capaUrl } = req.body;

  try {
    // Usamos o upsert para evitar erro de ISBN duplicado
    // Se o ISBN já existir, ele só atualiza (ou você pode retornar erro)
    const novoLivro = await prisma.livro.upsert({
      where: { isbn: isbn },
      update: {
        titulo,
        autor,
        capaUrl,
        quantidade: { increment: 1 } // Se já existe, aumenta o estoque
      },
      create: {
        isbn,
        titulo,
        autor,
        capaUrl,
        quantidade: 1
      }
    });

    res.status(201).json(novoLivro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar o livro no banco de dados." });
  }
});

// Buscar apenas alunos
app.get('/usuarios/alunos', async (req, res) => {
  const alunos = await prisma.usuario.findMany({ where: { role: 'USER' } });
  res.json(alunos);
});

// Criar novo usuário (Admin ou Aluno)
app.post('/usuarios', async (req, res) => {
  const { nome, email, senha, role } = req.body;
  try {
    const novo = await prisma.usuario.create({
      data: { nome, email, senha, role: role || 'USER' }
    });
    res.json(novo);
  } catch (e) {
    res.status(400).json({ error: "E-mail já cadastrado" });
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