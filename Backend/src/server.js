import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import userRoutes from './Routes/router.js';

const app = express();

// Configuração CORS
app.use(cors({
  origin: '*', // permite qualquer origem para teste
  credentials: true,
}));

app.use(express.json());
app.use('/api', userRoutes);

// Rota de teste
app.get('/api/', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor rodando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
