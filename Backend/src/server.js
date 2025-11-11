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
  "https://deskaura-backend.onrender.com"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // permite Postman e chamadas internas
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn("🚫 Bloqueado por CORS:", origin);
      return callback(new Error("NÃO AUTORIZADO POR CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Corrige preflight requests (CORS OPTIONS)
app.options("*", cors());

// =========================================================
// 1️⃣ Body parser
app.use(express.json());

// =========================================================
// 2️⃣ Segurança com Helmet
app.disable("x-powered-by");
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true,
  })
);

// =========================================================
// 3️⃣ Rate limiter — limita requisições no /login
app.set("trust proxy", 1); // necessário pro Render, Vercel etc.

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: "Muitas requisições, tente novamente mais tarde.",
});
app.use("/login", loginLimiter);

// =========================================================
// 4️⃣ Logging (pra debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// =========================================================
// 5️⃣ Rotas principais
app.use(router);

// =========================================================
// 6️⃣ Rotas auxiliares e administrativas
app.get("/admin/usuarios", async (req, res) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const usuarios = await prisma.user.findMany({
      select: { id_usuario: true, nome: true, email: true, ultimo_login: true },
      orderBy: { id_usuario: "desc" },
    });

    res.json({
      total: usuarios.length,
      usuarios: usuarios.map((u) => ({
        ...u,
        ultimo_login: u.ultimo_login
          ? new Date(u.ultimo_login).toLocaleString("pt-BR")
          : "Nunca",
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: error.message });
  }
});

// =========================================================
// 7️⃣ Health check (Render usa pra saber se o app tá no ar)
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend funcionando ✅" });
});

// =========================================================
// 8️⃣ Rota base
app.get("/", (req, res) => {
  res.json({ message: "DeskAura Backend está online 🚀" });
});

// =========================================================
// 🚀 Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
