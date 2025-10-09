import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "marcos_aurelo_secret";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1d" });
};

// Cadastro
export const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: { nome, email, senha_hash: hashedPassword },
    });

    res.status(201).json({ message: "Usuário cadastrado com sucesso", user });
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
    if (!user) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const validPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

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
