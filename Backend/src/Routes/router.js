import express from "express";
import {
  cadastrarUsuario,
  loginUsuario,
  perfilUsuario,
  atualizarSenha,
} from "../Controllers/userController.js";

import {
  criarSimulacao,
  listarSimulacoes,
} from "../Controllers/simulacaoController.js";

const router = express.Router();

// Usuário
router.post("/cadastro", cadastrarUsuario);
router.post("/login", loginUsuario);
router.get("/perfil", perfilUsuario);
router.put("/senha", atualizarSenha);

// Simulações
router.post("/simulacoes", criarSimulacao);
router.get("/simulacoes", listarSimulacoes);

// Health check
router.get("/health", (req, res) => res.json({ status: "OK" }));

export default router;
