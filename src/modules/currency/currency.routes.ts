import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { convertir, taux } from "./currency.controller";

const router = Router();

router.get("/taux", requireAuth, taux);
router.get("/convertir", requireAuth, convertir);

export default router;