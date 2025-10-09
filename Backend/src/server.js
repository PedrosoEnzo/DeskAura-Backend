import express from "express";
import cors from "cors";
import helmet from "helmet"
import rateLimit from "express-rate-limit";
import router from "./Routes/router.js";

const app = express();
const PORT = process.env.PORT || 3000;

//Segurança com kali

//removendo header que vaza express no kali
app.disable("x-powered-by");

//helmet serve para adicionar headers de segurança
app.use(helmet());

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

// Configuração do CORS - Permitindo todas as origens (para desenvolvimento)
app.use(cors({
    origin: "*", // Em produção, substitua por URLs específicas
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(express.json());
app.use(router);

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