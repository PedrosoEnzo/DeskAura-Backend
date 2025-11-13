import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./Routes/router.js";

const app = express();
const PORT = process.env.PORT || 3000;

// 🌐 CORS — compatível com Render, Vercel e localhost
const allowedOrigins = [
  "http://localhost:5173",
  "https://deskaura.vercel.app",
  "https://deskaura-frontend.onrender.com",
  "https://deskaura.netlify.app",
];

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

// Body parser
app.use(express.json());

// Segurança com Helmet
app.disable("x-powered-by");
app.use(helmet());

// Rate limiter — limita requisições no /login
app.set("trust proxy", 1);
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Muitas requisições, tente novamente mais tarde.",
});
app.use("/login", loginLimiter);

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas principais
app.use("/api", router);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend funcionando ✅" });
});

// Inicialização
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
