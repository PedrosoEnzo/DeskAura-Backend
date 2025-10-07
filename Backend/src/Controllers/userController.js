import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Cadastro de usuário (alternativo)
export const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const usuarioExistente = await prisma.User.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const user = await prisma.User.create({
      data: { nome, email, senha: senha_hash },
      select: { id: true, nome: true, email: true },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Erro no cadastrarUsuario:", error);
    res.status(500).json({ error: "Erro interno do servidor", details: error.message });
  }
};

// Login de usuário (alternativo)
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await prisma.User.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Email ou senha inválidos" });
    }

    res.json({ message: "Login bem-sucedido", user });
  } catch (error) {
    console.error("Erro no loginController:", error);
    res.status(500).json({ error: "Erro interno do servidor", details: error.message });
  }
};

// Buscar usuário por ID
export const findOne = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.User.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, nome: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro no findOne:", error);
    res.status(500).json({ error: "Erro interno do servidor", details: error.message });
  }
};
