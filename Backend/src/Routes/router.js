import express from "express";
import {
  cadastrarUsuario,
  loginUsuario,
  perfilUsuario,
} from "../Controllers/userController.js";

const router = express.Router();

router.post("/cadastro", cadastrarUsuario);
router.post("/login", loginUsuario);
router.get("/perfil", perfilUsuario);

router.get("/health", (req, res) => {
  res.json({ status: "OK", database: "Connected" });
});

export default router;
