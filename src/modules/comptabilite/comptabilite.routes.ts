import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import {
  bilan,
  comptes,
  creerCompteHandler,
  creerEcritureHandler,
  ecritures,
} from "./comptabilite.controller";

const router = Router();

router.get("/comptes", requireAuth, comptes);
router.post("/comptes", requireAuth, creerCompteHandler);
router.get("/ecritures", requireAuth, ecritures);
router.post("/ecritures", requireAuth, creerEcritureHandler);
router.get("/bilan", requireAuth, bilan);

export default router;
