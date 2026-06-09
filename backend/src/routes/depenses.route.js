import { Router } from "express";
import * as depenseController from "../controllers/depenses.controller.js";

const router = Router();

router.get("/details", depenseController.getExpensesDataController);

export default router;
