
import {
  NextFunction,
  Request,
  Response,
} from "express";

import { z } from "zod";

import {
  creerVente,
  listerVentes,
} from "./ventes.service";

// ==========================================
// VALIDATION DE LA CRÉATION D'UNE VENTE
// ==========================================
//
// Le montant n'est PAS reçu ici.
//
// Le montant est calculé côté backend
// à partir de :
//
// produit.prixUnitaire × quantite
//
const creerVenteSchema = z.object({
  activiteId: z.string().uuid(),

  clientId: z.string().uuid(),

  produitId: z.string().uuid(),

  quantite: z.number().positive(),

  modePaiement: z.enum([
    "COMPTANT",
    "CREDIT",
  ]),
});

// ==========================================
// CRÉER UNE VENTE
// ==========================================

export async function creer(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body =
      creerVenteSchema.parse(
        req.body
      );

    const vente =
      await creerVente({
        ...body,

        // L'utilisateur connecté est
        // récupéré depuis le token.
        saisiParId:
          req.user!.id,
      });

    res
      .status(201)
      .json(vente);

  } catch (err) {
    next(err);
  }
}

// ==========================================
// LISTER LES VENTES
// ==========================================

export async function lister(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const activiteId =
      req.query.activiteId as string;

    const ventes =
      await listerVentes(
        activiteId
      );

    res.json(ventes);

  } catch (err) {
    next(err);
  }
}
