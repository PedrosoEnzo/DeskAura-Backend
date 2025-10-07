import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import userRoutes from './Routes/router.js';

const app = express();

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:5173', // URL do seu front-end
  credentials: true,               // se precisar enviar cookies
}));

app.use(express.json());
app.use('/api', userRoutes);

app.get('/api/', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor rodando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
