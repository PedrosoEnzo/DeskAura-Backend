import express from "express";
import * as userController from "../Controllers/userController.js";

const router = express.Router();

router.post("/cadastro", userController.cadastrarUsuario);
router.post("/login", userController.login);

export default router;
