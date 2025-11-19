import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Gera código numérico de 6 dígitos
function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// === 1. ENVIAR CÓDIGO ===
export const enviarCodigoRecuperacao = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Email não encontrado" });

    const codigo = gerarCodigo();
    const expiracao = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Salvar código
    await prisma.recuperacaoSenha.create({
      data: {
        email,
        codigo,
        expiracao,
      },
    });

    // Envio de email (simulado)
    console.log("📩 Código de recuperação:", codigo);

    res.json({ message: "Código enviado para o email" });
  } catch (error) {
    console.error("Erro ao gerar código:", error);
    res.status(500).json({ error: "Erro ao gerar código" });
  }
};

// === 2. VALIDAR CÓDIGO ===
export const validarCodigo = async (req, res) => {
  try {
    const { email, codigo } = req.body;

    const registro = await prisma.recuperacaoSenha.findFirst({
      where: {
        email,
        codigo,
        usado: false,
      },
      orderBy: { id: "desc" },
    });

    if (!registro) return res.status(400).json({ error: "Código inválido" });
    if (registro.expiracao < new Date())
      return res.status(400).json({ error: "Código expirado" });

    res.json({ message: "Código válido" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao validar código" });
  }
};

// === 3. REDEFINIR SENHA ===
export const redefinirSenha = async (req, res) => {
  try {
    const { email, novaSenha } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const novaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.user.update({
      where: { id_usuario: user.id_usuario },
      data: { senha_hash: novaHash },
    });

    // Marca todos os códigos anteriores como usados
    await prisma.recuperacaoSenha.updateMany({
      where: { email, usado: false },
      data: { usado: true },
    });

    res.json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ error: "Erro ao redefinir senha" });
  }
};
