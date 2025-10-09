import express from "express";
import cors from "cors"; // Não se esqueça de instalar o pacote cors
import router from "./Routes/router.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS
app.use(cors({
  origin: "http://localhost:5173", // URL do seu frontend em desenvolvimento
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});