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

import { 
  enviarCodigoRecuperacao,
  validarCodigo,
  redefinirSenha
} from "../Controllers/recoveryController.js";

router.post("/esqueci-senha", enviarCodigoRecuperacao);
router.post("/validar-codigo", validarCodigo);
router.put("/redefinir-senha", redefinirSenha);

// Usuário
router.post("/cadastro", cadastrarUsuario);
router.post("/login", loginUsuario);
router.get("/perfil", perfilUsuario);
router.put("/senha", atualizarSenha);
router.put("/atualizar-senha", atualizarSenha);
// Simulações
router.post("/simulacoes", criarSimulacao);
router.get("/simulacoes", listarSimulacoes);

// Health check
router.get("/health", (req, res) => res.json({ status: "OK" }));

export default router;
