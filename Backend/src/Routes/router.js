import express from "express";
import { cadastrarUsuario, loginUsuario } from "../Controllers/userController.js";

const router = express.Router();

router.post("/cadastro", cadastrarUsuario);
router.post("/login", loginUsuario);

// Health check
router.get("/health", (req, res) => {
    res.json({ status: "OK", database: "Connected" });
});

export default router;