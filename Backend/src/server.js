import express from "express";
import cors from "cors";
import userRoutes from "./routes/router.js"; // caminho para as rotas

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
