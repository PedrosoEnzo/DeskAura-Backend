import express from "express";
import { cadastrarUsuario, loginUsuario } from "../controllers/userController";

const router = express.Router();

router.post("/cadastro", cadastrarUsuario);
router.post("/login", loginUsuario);

export default router;
