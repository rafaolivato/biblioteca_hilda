import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'biblioteca_hilda_secret';

export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  const usuario = await prisma.usuario.findUnique({
    where: { email }
  });

  if (!usuario) {
    return res.status(401).json({ message: "E-mail ou senha inválidos" });
  }

  // Compara a senha enviada com o hash no banco
  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    return res.status(401).json({ message: "E-mail ou senha inválidos" });
  }

  // Gera o Token JWT
  const token = jwt.sign(
    { id: usuario.id, role: usuario.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return res.json({
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    token
  });
};