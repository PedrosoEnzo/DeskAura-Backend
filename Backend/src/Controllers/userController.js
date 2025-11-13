import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "marcos_aurelo_secret";

// Gera token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1d" });
};

// Middleware para verificar token
const authMiddleware = async (req, res, next) => {
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
    if (existingUser)
      return res.status(400).json({ error: "Email já cadastrado" });

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: { nome, email, senha_hash: hashedPassword },
    });

    const token = generateToken(user.id_usuario);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    res.status(500).json({ error: "Erro ao cadastrar usuário" });
  }
};

// Login
export const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "Email ou senha inválidos" });

    const validPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!validPassword)
      return res.status(401).json({ error: "Email ou senha inválidos" });

    await prisma.user.update({
      where: { id_usuario: user.id_usuario },
      data: { ultimo_login: new Date() },
    });

    const token = generateToken(user.id_usuario);
    const { senha_hash, ...userSemSenha } = user;

    res.json({ user: userSemSenha, token });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Perfil (com token JWT)
export const perfilUsuario = [
  authMiddleware,
  async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id_usuario: req.userId },
        select: { id_usuario: true, nome: true, email: true, ultimo_login: true },
      });

      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

      res.json({
        ...user,
        ultimo_login: user.ultimo_login
          ? new Date(user.ultimo_login).toLocaleString("pt-BR")
          : "Nunca",
      });
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      res.status(500).json({ error: "Erro ao buscar perfil" });
    }
  },
];
