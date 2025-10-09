import express from "express";
import cors from "cors";
import userRoutes from "./Routes/router.js";


// ... restante do código
const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // URL do seu frontend
  credentials: true, // Se estiver usando cookies ou autenticação
}));

app.use(express.json());

// Rotas
app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
