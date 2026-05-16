import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

//post est utilisé pour login parce que c'est comme si on créé une session
//et aussi parce qu'on veut faire circuler des informations sans que ça soit visible
//dans la barre de navigation
// post est utilisé pour logout parce qu'on peut faire passer quand meme des infos
//dans le body de la requette et qu'on veut pas que ça se sache et c'est pas delete parce
//delete c'est plutot pour des informations précises avec id
// tous les /register, /login... ne sont pas visibles dans la barre de navigation
//c'est juste un nom de code pour enclencher la fonction de l'api
router.post("/register", authController.register);
router.post("/login", authController.signIn);
router.post("/logout", authController.signOut);

router.put("/updateprofildata", authController.updateAccount);
router.post("/resetpassword", authController.pageResetPassword);

export default router;
