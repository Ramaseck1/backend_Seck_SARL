import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { consolide, journalier } from "./reporting.controller";

const router = Router();

router.get("/journalier", requireAuth, journalier);
router.get("/consolide", requireAuth, consolide);

export default router;
