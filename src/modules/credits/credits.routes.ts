import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { enRetard, parClient, rembourser } from "./credits.controller";

const router = Router();

router.post("/remboursements", requireAuth, rembourser);
router.get("/en-retard", requireAuth, enRetard);
router.get("/client/:clientId", requireAuth, parClient);

export default router;
