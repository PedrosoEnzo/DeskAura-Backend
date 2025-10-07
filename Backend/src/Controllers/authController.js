// src/Controllers/authController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "marcos_aurelo_secret";

// Gera token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1d" });
};

// Cadastro
export const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const existingUser = await prisma.Usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const user = await prisma.Usuario.create({
      data: { nome, email, senha_hash },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        ultimo_login: true
      }
    });

    const token = generateToken(user.id_usuario);

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    console.log("Login attempt:", email); // log de tentativa

    const user = await prisma.Usuario.findUnique({ where: { email } });
    if (!user) {
      console.log("Usuário não encontrado");
      return res.status(400).json({ error: "Credenciais inválidas" });
    }

    const validPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!validPassword) {
      console.log("Senha inválida para:", email);
      return res.status(400).json({ error: "Credenciais inválidas" });
    }

    await prisma.Usuario.update({
      where: { id_usuario: user.id_usuario },
      data: { ultimo_login: new Date() }
    });

    const token = generateToken(user.id_usuario);
    const { senha_hash, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Erro no loginController:", error); // log detalhado
    res.status(500).json({ error: "Erro interno do servidor", details: error.message });
  }
};
