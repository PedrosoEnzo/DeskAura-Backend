import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

// Buscar todos os usuários
export const cadastrarUsuario = async (req, res) => {
  try {
    const users = await prisma.Usuario.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        ultimo_login: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar um usuário pelo ID
export const findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.Usuario.findUnique({
      where: { id_usuario: parseInt(id) },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        ultimo_login: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: error.message });
  }
};

// Criar um novo usuário
export const create = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Verifica se já existe usuário com o mesmo email
    const usuarioExistente = await prisma.Usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criptografa a senha
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

    res.status(201).json(user);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: error.message });
  }
};

