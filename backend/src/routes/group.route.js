import { Router } from "express";
import * as groupController from "../controllers/group.controller.js";

const router = Router();

router.post("/create-group", groupController.createGroup);

router.get("/my-group", groupController.getGroupId);
router.get("/my-group-name", groupController.getGroupName);
router.get("/members-name", groupController.getMemberName);
router.get("/members-name-initials", groupController.getNameInitials);
router.put("/record-member-id", groupController.recordMemberId);

//cette commande est indispensable pour donner le router au serveur
export default router;
