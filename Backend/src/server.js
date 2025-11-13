import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./Routes/router.js";

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================================
// 🌐 CORS — compatível com Render, Vercel e localhost
const allowedOrigins = [
  "http://localhost:5173",
  "https://deskaura.vercel.app",
  "https://deskaura-frontend.onrender.com",
  "https://deskaura.netlify.app",
];



// Rota para atualizar senha
router.put("/api/atualizar-senha", autenticarToken, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const userId = req.user.id_usuario; // vem do token JWT

    // Busca usuário
    const user = await prisma.user.findUnique({ where: { id_usuario: userId } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    // Verifica senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, user.senha_hash);
    if (!senhaValida)
      return res.status(401).json({ error: "Senha atual incorreta" });

    // Atualiza senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
    await prisma.user.update({
      where: { id_usuario: userId },
      data: { senha_hash: novaSenhaHash },
    });

    res.json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar senha" });
  }
});



app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("🚫 Bloqueado por CORS:", origin);
      return callback(new Error("NÃO AUTORIZADO POR CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);



// =========================================================
// 1️⃣ Body parser
app.use(express.json());

// =========================================================
// 2️⃣ Segurança com Helmet
app.disable("x-powered-by");
app.use(helmet());

// =========================================================
// 3️⃣ Rate limiter — limita requisições no /login
app.set("trust proxy", 1);
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Muitas requisições, tente novamente mais tarde.",
});
app.use("/login", loginLimiter);

// =========================================================
// 4️⃣ Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// =========================================================
// 5️⃣ Rotas principais
app.use("/api", router);

// =========================================================
// 6️⃣ Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend funcionando ✅" });
});

// =========================================================
// 7️⃣ Inicialização
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
