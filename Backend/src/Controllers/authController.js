import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "marcos_aurelo_secret";

// Gera token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1d" });
};

// Cadastro de usuário
export const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Verifica se o email já existe
    const existingUser = await prisma.User.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Cria o usuário
    const user = await prisma.User.create({
      data: { nome, email, senha: senha_hash },
      select: { id: true, nome: true, email: true },
    });

    const token = generateToken(user.id);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Erro no register:", error);
    res.status(500).json({ error: "Erro interno do servidor", details: error.message });
  }
};

// Login de usuário
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await prisma.User.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const token = generateToken(user.id);

    const { senha: senhaHash, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor", details: error.message });
  }
};
