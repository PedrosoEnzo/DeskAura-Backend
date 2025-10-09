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
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Cria o usuário
    const user = await prisma.user.create({
      data: { 
        nome, 
        email, 
        senha_hash, // Corrigido: use senha_hash em vez de senha
      },
      select: { 
        id_usuario: true, // Corrigido: use id_usuario em vez de id
        nome: true, 
        email: true 
      },
    });

    const token = generateToken(user.id_usuario); // Corrigido: use id_usuario

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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const validPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id_usuario: user.id_usuario },
      data: { ultimo_login: new Date() },
    });

    const token = generateToken(user.id_usuario);

    // Remover senha_hash da resposta
    const { senha_hash, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor", details: error.message });
  }
};