import { Router } from "express";
// authRoutes c'est le nom par défaut qui est indiqué et qui est possible
// d'être indiqué sans le déclarer dans un autre fichier parce que dans auth.route.js
// on a mis export default router;
import authRoutes from "./auth.route.js";
import profilRoutes from "./profil.route.js";
import groupRoutes from "./group.route.js";
import depensesRoutes from "./depenses.route.js";

const router = Router();

// use veut dire pour toutes les requêtes qui passent
// par ici, applique cette règle
router.use("/auth", authRoutes);
router.use("/profil", profilRoutes);
router.use("/group", groupRoutes);
router.use("/depenses", depensesRoutes);

export default router;
