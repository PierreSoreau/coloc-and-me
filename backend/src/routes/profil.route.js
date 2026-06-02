import { Router } from "express";
import * as profilController from "../controllers/profil.controller.js";

const router = Router();

router.get("/name", profilController.getProfilInitials);
router.get("/dataProfil", profilController.getDataProfil);

export default router;
