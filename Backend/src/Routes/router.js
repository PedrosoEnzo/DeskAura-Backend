import express from "express";
import { cadastrarUsuario } from "../controllers/userController.js";

const router = express.Router();

router.post("/cadastro", cadastrarUsuario);

export default router;
