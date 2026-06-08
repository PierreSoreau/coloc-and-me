import { Router } from "express";
import * as profilController from "../controllers/profil.controller.js";

const router = Router();

router.get("/name", profilController.getProfilInitials);
router.get("/dataProfil", profilController.getDataProfil);
router.delete("/delete-group-data", profilController.deleteGroup);

export default router;
