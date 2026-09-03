import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { creer, lister } from "./fournisseurs.controller";

const router = Router();

router.get("/", requireAuth, lister);
router.post("/", requireAuth, creer);

export default router;
