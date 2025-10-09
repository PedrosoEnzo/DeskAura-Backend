import express from "express";
import cors from "cors";
import router from "./Routes/router.js";

const app = express();
const PORT = process.env.PORT || 3000;

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