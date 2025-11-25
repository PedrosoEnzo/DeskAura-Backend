// src/Controllers/simulacaoController.js
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./userController.js";

const prisma = new PrismaClient();

// Função para gerar recomendações simples
function gerarRecomendacoes(cultura, solo, adubo, regiao) {
  return [
    `Plantio recomendado de ${cultura} no solo ${solo} usando ${adubo}.`,
    `Região considerada: ${regiao}.`
  ];
}

// Função para calcular score baseado nos inputs
function calcularScore(cultura, solo, adubo, regiao) {
  const scores = {
    solo: { Latossolo: 25, Argissolo: 25, Neossolo: 20, Nitossolo: 25, Gleissolo: 20, Cambissolo: 15 },
    adubo: { Organico: 25, Mineral: 20 },
    regiao: { Norte: 20, Nordeste: 15, CentroOeste: 25, Sudeste: 20, Sul: 20 },
    cultura: { Milho: 10, Feijao: 15, Mandioca: 20, Hortaliças: 10, Frutas: 5, Arroz: 10, Café: 5 },
  };

  const score =
    (scores.solo[solo] || 0) +
    (scores.adubo[adubo] || 0) +
    (scores.regiao[regiao] || 0) +
    (scores.cultura[cultura] || 0);

  return score;
}

// Função para estimar produtividade com base no score
function produtividadeBase(cultura, score) {
  const ref = {
    Milho: { baixa: 70, alta: 150 },
    Feijao: { baixa: 12, alta: 30 },
    Mandioca: { baixa: 10, alta: 30 },
    Hortaliças: { baixa: 5, alta: 20 },
    Frutas: { baixa: 5, alta: 40 },
    Arroz: { baixa: 30, alta: 80 },
    Café: { baixa: 10, alta: 40 },
  };
  const c = ref[cultura] || { baixa: 50, alta: 100 };
  return Math.round(c.baixa + (score / 100) * (c.alta - c.baixa));
}

// Criar simulação
export const criarSimulacao = [
  authMiddleware,
  async (req, res) => {
    try {
      const { cultura, solo, adubo, regiao } = req.body;

      if (!cultura || !solo || !adubo || !regiao) {
        return res.status(400).json({ error: "Todos os campos (cultura, solo, adubo, regiao) são obrigatórios." });
      }

      const scoreFinal = calcularScore(cultura, solo, adubo, regiao);
      const produtividade = produtividadeBase(cultura, scoreFinal);
      const recomendacoes = gerarRecomendacoes(cultura, solo, adubo, regiao);

      const simulacao = await prisma.simulacao.create({
        data: {
          cultura,
          solo,
          adubo,
          regiao,
          score: scoreFinal,
          produtividade,
          recomendacoes: JSON.stringify(recomendacoes),
          usuarioId: req.userId,
        },
      });

      res.status(201).json({ ...simulacao, recomendacoes });
    } catch (error) {
      console.error("Erro criar simulacao:", error);
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
      const parsed = simulacoes.map(s => ({ ...s, recomendacoes: JSON.parse(s.recomendacoes) }));
      res.json(parsed);
    } catch (error) {
      console.error("Erro listar simulacoes:", error);
      res.status(500).json({ error: "Erro ao buscar simulações" });
    }
  },
];
