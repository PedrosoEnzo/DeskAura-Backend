import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./Routes/router.js";

const app = express();
const PORT = process.env.PORT || 3000;

// 🌐 Domínios autorizados
const allowedOrigins = [
  "http://localhost:5173",
  "https://deskaura.vercel.app",
  "https://deskaura-frontend.onrender.com",
  "https://deskaura.netlify.app"
];

// =========================================================
// 1️⃣ Body parser
app.use(express.json());

// =========================================================
// 2️⃣ CORS 
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem 'origin' (tipo Postman, servidor interno etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("🚫 Bloqueado por CORS:", origin);
        return callback(new Error("NÃO AUTORIZADO POR CORS"));
      }
    },
    credentials: true,
  })
);

// =========================================================
// 3️⃣ Segurança
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
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
);

// =========================================================
// 4️⃣ Rate limiter
app.set("trust proxy", 1); // Necessário para proxies (Render, Vercel etc.)

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Muitas requisições, tente novamente mais tarde.",
});
app.use("/login", loginLimiter);

// =========================================================
// 5️⃣ Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// =========================================================
// 6️⃣ Rotas principais
app.use(router);

// =========================================================
// 7️⃣ Rotas auxiliares
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
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend funcionando" });
});

app.get("/", (req, res) => {
  res.json({ message: "DeskAura Backend está online!" });
});

// =========================================================
// 🚀 Inicialização
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
