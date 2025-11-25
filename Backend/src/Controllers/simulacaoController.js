import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./userController.js";

const prisma = new PrismaClient();

// ======== Funções auxiliares ========
function faixa(valor, idealMin, idealMax) {
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
    feijao: { baixa: 12, alta: 30 }
  };
  const c = ref[cultura] || ref["milho"];
  return Math.round(c.baixa + (score / 100) * (c.alta - c.baixa));
}

// ======== Criar simulação ========
export const criarSimulacao = [
  authMiddleware,
  async (req, res) => {
    try {
      const data = req.body;

      // ---- Cálculos ----
      const aguaScore = faixa(data.chuva_mm, 80, 140);
      const tempScore = faixa(data.temperatura, 20, 30);
      const phScore = faixa(data.ph, 5.5, 6.5);

      const nutrientesScore =
        (faixa(data.nitrogenio, 50, 120) +
         faixa(data.fosforo, 30, 60) +
         faixa(data.potassio, 40, 90)) / 3;

      const soloScore =
        data.solo === "argiloso" ? 90 :
        data.solo === "misto"    ? 75 : 60;

      const pragasScore = 100 - data.risco_pragas;

      const scoreFinal = Math.round(
        (aguaScore * 0.2) +
        (tempScore * 0.2) +
        (phScore * 0.15) +
        (nutrientesScore * 0.25) +
        (soloScore * 0.1) +
        (pragasScore * 0.1)
      );

      const produtividade = produtividadeBase(data.cultura, scoreFinal);
      const recomendacoes = gerarRecomendacoes(data);

      // ---- Salvar ----
      const simulacao = await prisma.simulacao.create({
        data: {
          ...data,
          score: scoreFinal,
          produtividade,
          recomendacoes: JSON.stringify(recomendacoes),
          usuarioId: req.userId,
        }
      });

      res.status(201).json(simulacao);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar simulação" });
    }
  },
];


// ======== Listar ========
export const listarSimulacoes = [
  authMiddleware,
  async (req, res) => {
    try {
      const simulacoes = await prisma.simulacao.findMany({
        where: { usuarioId: req.userId },
        orderBy: { data: "desc" },
      });

      res.json(
        simulacoes.map(s => ({
          ...s,
          recomendacoes: JSON.parse(s.recomendacoes)
        }))
      );

    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar simulações" });
    }
  },
];
