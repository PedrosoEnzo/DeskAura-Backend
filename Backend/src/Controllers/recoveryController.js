import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { enviarEmailRecuperacao } from "../services/emailService.js";

const prisma = new PrismaClient();

// Gera um código numérico de 6 dígitos
function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ======================================================
// 1. ENVIAR CÓDIGO DE RECUPERAÇÃO
// ======================================================
export const enviarCodigoRecuperacao = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Email não encontrado" });

    const codigo = gerarCodigo();
    const expiracao = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Salvar código no banco
    await prisma.recuperacaoSenha.create({
      data: {
        email,
        codigo,
        expiracao,
      },
    });

    // Envia email REAL via Brevo
    await enviarEmailRecuperacao(email, codigo);

    res.json({ message: "Código enviado para o email!" });
  } catch (error) {
    console.error("Erro ao enviar código:", error);
    res.status(500).json({ error: "Erro ao enviar código" });
  }
};

// ======================================================
// 2. VALIDAR CÓDIGO
// ======================================================
export const validarCodigo = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    const registro = await prisma.recuperacaoSenha.findFirst({
      where: { email, codigo },
    });

    if (!registro) {
      return res.status(400).json({ error: "Código inválido" });
    }

    if (new Date() > registro.expiracao) {
      return res.status(400).json({ error: "Código expirado" });
    }

    return res.json({ message: "Código válido!" });

  } catch (error) {
    console.error("Erro ao validar código:", error);
    res.status(500).json({ error: "Erro ao validar código" });
  }
};

// ======================================================
// 3. REDEFINIR SENHA
// ======================================================
export const redefinirSenha = async (req, res) => {
  try {
    const { email, codigo, novaSenha } = req.body;

    const registro = await prisma.recuperacaoSenha.findFirst({
      where: { email, codigo },
    });

    if (!registro) {
      return res.status(400).json({ error: "Código inválido" });
    }

    if (new Date() > registro.expiracao) {
      return res.status(400).json({ error: "Código expirado" });
    }

    // Criar hash da nova senha
    const novaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza senha do usuário
    await prisma.user.update({
      where: { email },
      data: { senha_hash: novaHash },
    });

    // Remove todos os códigos desse email (limpeza)
    await prisma.recuperacaoSenha.deleteMany({
      where: { email },
    });

    return res.json({ message: "Senha redefinida com sucesso!" });

  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ error: "Erro ao redefinir senha" });
  }
};
