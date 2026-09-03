import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { creer, lister, valeurNette } from "./actifs.controller";

const router = Router();

router.get("/", requireAuth, lister);
router.post("/", requireAuth, creer);
router.get("/:id/valeur-nette", requireAuth, valeurNette);

export default router;
