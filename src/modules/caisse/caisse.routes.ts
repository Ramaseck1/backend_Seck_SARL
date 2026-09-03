import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { creer, lister, solde } from "./caisse.controller";

const router = Router();

router.get("/mouvements", requireAuth, lister);
router.post("/mouvements", requireAuth, creer);
router.get("/solde", requireAuth, solde);

export default router;
