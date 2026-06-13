import { Router } from "express";
import * as depenseController from "../controllers/depenses.controller.js";
import * as remboursementController from "../controllers/remboursement.controller.js";

const router = Router();

router.get("/details", depenseController.getExpensesDataController);
router.get("/debt-data", remboursementController.getDebtData);
router.get("/balance-data", remboursementController.getallUserBalance);
router.get(
  "/reimboursement-data",
  remboursementController.getAllReimboursementData,
);
router.get("/detail-expense", depenseController.getInformationExpense);
router.post("/new-expense", depenseController.addNewExpense);
router.post("/new-debt", depenseController.addNewDebt);

export default router;
