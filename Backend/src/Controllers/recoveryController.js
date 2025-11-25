import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { enviarEmailRecuperacao } from "../services/emailService.js";

const prisma = new PrismaClient();

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Enviar código
export const enviarCodigoRecuperacao = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Email não encontrado" });

    const codigo = gerarCodigo();
    const expiracao = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.recuperacaoSenha.create({ data: { email, codigo, expiracao } });

    // envia email
    await enviarEmailRecuperacao(email, codigo);

    res.json({ message: "Código enviado para o email!" });
  } catch (error) {
    console.error("Erro ao enviar código:", error);
    res.status(500).json({ error: "Erro ao enviar código" });
  }
};

// Validar código
export const validarCodigo = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    const registro = await prisma.recuperacaoSenha.findFirst({ where: { email, codigo, usado: false }, orderBy: { id: "desc" } });
    if (!registro) return res.status(400).json({ error: "Código inválido" });
    if (new Date() > registro.expiracao) return res.status(400).json({ error: "Código expirado" });
    res.json({ message: "Código válido" });
  } catch (error) {
    console.error("Erro validar codigo:", error);
    res.status(500).json({ error: "Erro ao validar código" });
  }
};

// Redefinir senha
export const redefinirSenha = async (req, res) => {
  try {
    const { email, codigo, novaSenha } = req.body;
    const registro = await prisma.recuperacaoSenha.findFirst({ where: { email, codigo, usado: false }, orderBy: { id: "desc" } });
    if (!registro) return res.status(400).json({ error: "Código inválido" });
    if (new Date() > registro.expiracao) return res.status(400).json({ error: "Código expirado" });

    const novaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.user.update({ where: { email }, data: { senha_hash: novaHash } });

    await prisma.recuperacaoSenha.updateMany({ where: { email }, data: { usado: true } });

    res.json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error("Erro redefinir senha:", error);
    res.status(500).json({ error: "Erro ao redefinir senha" });
  }
};
