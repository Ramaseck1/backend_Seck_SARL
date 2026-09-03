import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { creer, lister, obtenir, soldes, modifier, supprimer, supprimerPlusieurs } from "./clients.controller";

const router = Router();

router.get("/", requireAuth, lister);
router.get("/:id", requireAuth, obtenir);
router.get("/:id/soldes", requireAuth, soldes);
router.post("/", requireAuth, creer);
router.put("/:id", requireAuth, modifier);
router.delete("/batch", requireAuth, supprimerPlusieurs); // route déclarée avant /:id
router.delete("/:id", requireAuth, supprimer);

export default router;