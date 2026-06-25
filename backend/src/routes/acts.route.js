import { Router } from "express";
import * as actsController from "../controllers/acts.controller.js";

const router = Router();

router.post("/new-act", actsController.newAct);
router.get("/all-acts", actsController.getAllActs);
router.put("/update-status", actsController.updateStatus);
router.delete("/delete-act", actsController.deleteAct);
router.put("/update-act", actsController.updateAct);
router.get("/get-one-act", actsController.getOneAct);

//cette commande est indispensable pour donner le router au serveur
export default router;
