import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "marcos_aurelo_secret";

// Função para gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1d" });
};

// Cadastro de usuário
export const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const usuarioExistente = await prisma.User.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const user = await prisma.User.create({
      data: { nome, email, senha_hash },
      select: { id_usuario: true, nome: true, email: true },
    });

    const token = generateToken(user.id_usuario);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Erro no cadastrarUsuario:", error);
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

    const validPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    // Atualiza último login
    await prisma.User.update({
      where: { id_usuario: user.id_usuario },
      data: { ultimo_login: new Date() },
    });

    const token = generateToken(user.id_usuario);

    const { senha_hash, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor", details: error.message });
  }
};
