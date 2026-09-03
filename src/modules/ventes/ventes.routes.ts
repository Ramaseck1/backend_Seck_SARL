import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { creer, lister } from "./ventes.controller";

const router = Router();

router.post("/", requireAuth, creer);
router.get("/", requireAuth, lister);

export default router;
