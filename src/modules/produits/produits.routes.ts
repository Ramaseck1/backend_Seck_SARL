import { Router } from "express";

import { requireAuth } from "../../middlewares/auth";

import {
  ajuster,
  alertes,
  bilan,
  creer,
  lister,
} from "./produits.controller";


const router = Router();


router.get(
  "/",
  requireAuth,
  lister
);


router.get(
  "/alertes",
  requireAuth,
  alertes
);


router.get(
  "/:id/bilan",
  requireAuth,
  bilan
);


router.post(
  "/",
  requireAuth,
  creer
);


router.patch(
  "/:id/stock",
  requireAuth,
  ajuster
);


export default router;