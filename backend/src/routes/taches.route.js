import { Router } from "express";
import * as tachesController from "../controllers/taches.controller.js";

const router = Router();

router.post("/new-task", tachesController.newTask);
router.get("/all-tasks", tachesController.getTasks);
router.get("/date-limite", tachesController.getDates);
router.put("/update-task-status", tachesController.updateStatus);

export default router;
