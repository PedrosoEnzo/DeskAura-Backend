import express from "express";
import * as userController from "../Controllers/userController.js";

const router = express.Router();

// Deve ser assim:
router.post("/cadastro", userController.cadastrarUsuario);

export default router;
