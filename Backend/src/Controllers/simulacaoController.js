import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./userController.js";

const prisma = new PrismaClient();

// Criar simulação
export const criarSimulacao = [
  authMiddleware,
  async (req, res) => {
    try {
      const { cultura, solo, score } = req.body;

      const simulacao = await prisma.simulacao.create({
        data: {
          cultura,
          solo,
          score,
          usuarioId: req.userId,
        },
      });

      res.status(201).json(simulacao);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar simulação" });
    }
  },
];

// Listar simulações do usuário
export const listarSimulacoes = [
  authMiddleware,
  async (req, res) => {
    try {
      const simulacoes = await prisma.simulacao.findMany({
        where: { usuarioId: req.userId },
        orderBy: { data: "desc" },
      });

      res.json(simulacoes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar simulações" });
    }
  },
];
