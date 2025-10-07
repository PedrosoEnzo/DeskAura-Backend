import express from "express";
import { cadastrarUsuario, loginUsuario } from "../Controllers/userController.js";

const router = express.Router();

router.post("/cadastro", cadastrarUsuario);
router.post("/login", loginUsuario);

export default router;
