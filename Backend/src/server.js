import express from "express";
import cors from "cors";
import helmet from "helmet"
import rateLimit from "express-rate-limit";
import router from "./Routes/router.js";

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = ["http://localhost:5173"];

app.use(express.json());
app.use(router);

//Segurança === com === kali ==================================

//removendo header que vaza express no kali
app.disable("x-powered-by");

//helmet serve para adicionar headers de segurança
app.use(helmet());

//Certifica que o HTTPS está sendo usado
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 ano em segundos
    includeSubDomains: true,
    preload: true,
  })
)

// Aquei ele limita o número de requiseções que um Ip pode fazer
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: "Muitas requisições, tente novamente mais tarde."
});
app.use("/login", loginLimiter);

// Configuração do CORS - Permitindo todas as origens (para desenvolvimento)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // mobile apps / non-browser
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("NÃO AUTORIZADO POR CORS"));
    },
    credentials: true,
  })
);


// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});




// Rota para ver usuários - 
app.get('/admin/usuarios', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const usuarios = await prisma.user.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        ultimo_login: true
      },
      orderBy: { id_usuario: 'desc' }
    });
    
    res.json({
      total: usuarios.length,
      usuarios: usuarios.map(u => ({
        ...u,
        ultimo_login: u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('pt-BR') : 'Nunca'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota de health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Backend funcionando" });
});

// Rota padrão para verificar se o servidor está rodando
app.get("/", (req, res) => {
    res.json({ message: "DeskAura Backend está online!" });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

