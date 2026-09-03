import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { creer, lister, obtenir } from "./activites.controller";

const router = Router();

router.get("/", requireAuth, lister);
router.get("/:id", requireAuth, obtenir);
router.post("/", requireAuth, creer);

export default router;
