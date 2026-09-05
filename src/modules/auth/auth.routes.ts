import { Router } from "express";
import { connexion, inscription,deconnexion } from "./auth.controller";
import { definir, verifier, modifier, reinitialiser } from "../pin/pin.controller";
import { requireAuth } from "../../middlewares/auth"; // ⚠️ vérifiez le chemin réel de votre fichier auth.ts

const router = Router();

router.post("/inscription", inscription);
router.post("/connexion", connexion);

router.post("/pin/definir", requireAuth, definir);
router.post("/pin/verifier", requireAuth, verifier);
router.put("/pin/modifier", requireAuth, modifier);
router.post("/pin/reinitialiser", requireAuth, reinitialiser);
router.post("/deconnexion", requireAuth, deconnexion);

export default router;