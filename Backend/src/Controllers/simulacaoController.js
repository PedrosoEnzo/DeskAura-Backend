import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./userController.js";

const prisma = new PrismaClient();

// Helpers
function faixa(valor, idealMin, idealMax) {
  if (valor === undefined || valor === null || Number.isNaN(Number(valor))) return 60;
  valor = Number(valor);
  if (valor < idealMin) return 60 * (valor / idealMin);
  if (valor > idealMax) return 60 * (idealMax / valor);
  return 100;
}

function gerarRecomendacoes(data) {
  const rec = [];
  if (data.ph < 5.5) rec.push("Solo ácido — considerar calagem.");
  if (data.nitrogenio < 50) rec.push("Nitrogênio baixo — aplicar adubação N.");
  if (data.fosforo < 30) rec.push("Fósforo insuficiente — usar MAP ou superfosfato.");
  if (data.potassio < 40) rec.push("Potássio baixo — considerar KCl.");
  if (data.risco_pragas > 60) rec.push("Alto risco de pragas — iniciar monitoramento.");
  if (data.chuva_mm < 80) rec.push("Baixa chuva — risco de estresse hídrico.");
  if (data.temperatura > 33) rec.push("Temperatura elevada — risco para floração.");
  return rec;
}

function produtividadeBase(cultura, score) {
  const ref = {
    milho: { baixa: 70, alta: 150 },
    soja: { baixa: 30, alta: 60 },
    trigo: { baixa: 25, alta: 55 },
    feijao: { baixa: 12, alta: 30 },
    mandioca: { baixa: 10, alta: 30 },
    hortaliças: { baixa: 5, alta: 20 },
    frutas: { baixa: 5, alta: 40 },
    arroz: { baixa: 30, alta: 80 },
    cafe: { baixa: 10, alta: 40 }
  };
  const c = ref[cultura.toLowerCase()] || ref["milho"];
  return Math.round(c.baixa + (score / 100) * (c.alta - c.baixa));
}

// Criar
export const criarSimulacao = [
  authMiddleware,
  async (req, res) => {
    try {
      const { cultura, solo, adubo, regiao } = req.body;

      // Score e produtividade simples (só pra manter lógica)
      const scoreFinal = 100; // como exemplo fixo
      const produtividade = 100; // pode ajustar ou usar referência por cultura
      const recomendacoes = [`Plantio recomendado de ${cultura} no solo ${solo} usando ${adubo}.`];

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


// Listar
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
