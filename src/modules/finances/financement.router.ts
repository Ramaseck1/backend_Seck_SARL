import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { creer, lister, obtenir, rembourser } from "./financement.controller";

const router = Router();

router.get("/", requireAuth, lister);
router.get("/:id", requireAuth, obtenir);
router.post("/", requireAuth, creer);
router.post("/:id/remboursements", requireAuth, rembourser);

export default router;