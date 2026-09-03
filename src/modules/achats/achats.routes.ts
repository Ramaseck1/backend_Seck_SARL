import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { creer, lister, paiement, reception } from "./achats.controller";

const router = Router();

router.get("/bons-commande", requireAuth, lister);
router.post("/bons-commande", requireAuth, creer);
router.post("/bons-commande/:id/reception", requireAuth, reception);
router.post("/factures/:id/paiements", requireAuth, paiement);

export default router;
