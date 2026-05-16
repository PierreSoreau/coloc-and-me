import { Router } from "express";
import authRoutes from "./auth.route.js";

const router = Router();

// use veut dire pour toutes les requêtes qui passent
// par ici, applique cette règle
router.use("/auth", authRoutes);

export default router;
