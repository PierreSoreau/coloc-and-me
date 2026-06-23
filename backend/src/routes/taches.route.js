import { Router } from "express";
import * as tachesController from "../controllers/taches.controller.js";

const router = Router();

router.post("/new-task", tachesController.newTask);
router.get("/all-tasks", tachesController.getTasks);
router.get("/date-limite", tachesController.getDates);
router.put("/update-task-status", tachesController.updateStatus);
router.delete("/delete-task", tachesController.taskDelete);
router.delete("/delete-all-task", tachesController.allTasksDelete);
router.get("/get-task", tachesController.getTaskById);
router.put("/update-task", tachesController.updateTaskDetail);
router.delete(
  "/delete-tasks-after-current-day",
  tachesController.deleteAfterCurrentDay,
);
router.post(
  "/create-tasks-after-current-day",
  tachesController.createAfterCurrentDay,
);

export default router;
