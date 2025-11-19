import SibApiV3Sdk from "@getbrevo/brevo";

const client = new SibApiV3Sdk.TransactionalEmailsApi();

// 🔐 Usa a API Key do .env
const brevoApiKey = process.env.BREVO_API_KEY;
if (!brevoApiKey) {
  throw new Error("BREVO_API_KEY não foi encontrada no .env");
}

client.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  brevoApiKey
);

export async function enviarEmailRecuperacao(email, codigo) {
  try {
    const sender = {
      email: "enzopedroso77@gmail.com", // precisa estar validado no Brevo
      name: "AURA System",
    };

    const receivers = [{ email }];

    await client.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Código de Recuperação - AURA",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color:#4CAF50;">Recuperação de Senha</h2>
          <p>Olá! Aqui está seu código de verificação:</p>

          <div style="
            margin: 20px 0;
            padding: 15px 20px;
            background-color: #f4f4f4;
            border-left: 4px solid #4CAF50;
            display: inline-block;
            font-size: 26px;
            letter-spacing: 3px;
          ">
            <strong>${codigo}</strong>
          </div>

          <p>Esse código expira em <strong>10 minutos</strong>.</p>
          <p>Se você não solicitou isto, apenas ignore.</p>

          <br>
          <p>Atenciosamente,</p>
          <strong>AURA System</strong>
        </div>
      `,
    });

    console.log("✔ Email enviado com sucesso para:", email);
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    throw new Error("Falha ao enviar email de recuperação.");
  }
}
