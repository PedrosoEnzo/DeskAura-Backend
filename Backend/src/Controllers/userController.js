import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "marcos_aurelo_secret";

const generateToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1d" });

// Middleware de autenticação
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });

  const [, token] = authHeader.split(" ");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Cadastro
export const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email já cadastrado" });

    const senha_hash = await bcrypt.hash(senha, 10);
    const user = await prisma.user.create({
      data: { nome, email, senha_hash },
    });

    const token = generateToken(user.id_usuario);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Erro ao cadastrar usuário" });
  }
};

// Login
export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Email ou senha inválidos" });

    const validPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!validPassword) return res.status(401).json({ error: "Email ou senha inválidos" });

    await prisma.user.update({
      where: { id_usuario: user.id_usuario },
      data: { ultimo_login: new Date() },
    });

    const token = generateToken(user.id_usuario);
    const { senha_hash, ...userData } = user;
    res.json({ user: userData, token });
  } catch {
    res.status(500).json({ error: "Erro interno no login" });
  }
};

// Perfil
export const perfilUsuario = [
  authMiddleware,
  async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id_usuario: req.userId },
        include: { simulacoes: true },
      });

      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      const { senha_hash, ...userData } = user;
      res.json(userData);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar perfil" });
    }
  },
];

// Atualizar senha
export const atualizarSenha = [
  authMiddleware,
  async (req, res) => {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const user = await prisma.user.findUnique({ where: { id_usuario: req.userId } });

      const validPassword = await bcrypt.compare(senhaAtual, user.senha_hash);
      if (!validPassword) return res.status(401).json({ error: "Senha atual incorreta" });

      const novaHash = await bcrypt.hash(novaSenha, 10);
      await prisma.user.update({
        where: { id_usuario: req.userId },
        data: { senha_hash: novaHash },
      });

      res.json({ message: "Senha atualizada com sucesso" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar senha" });
    }
  },
];
