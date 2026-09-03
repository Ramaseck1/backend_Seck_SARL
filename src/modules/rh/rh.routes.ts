import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { bulletin, creer, lister, presence } from "./rh.controller";

const router = Router();

router.get("/employes", requireAuth, lister);
router.post("/employes", requireAuth, creer);
router.post("/employes/:id/presences", requireAuth, presence);
router.post("/bulletins", requireAuth, bulletin);

export default router;
