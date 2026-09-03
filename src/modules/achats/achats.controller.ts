import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  creerBonCommande,
  listerBonsCommande,
  payerFacture,
  receptionnerBonCommande,
} from "./achats.service";

const ligneSchema = z.object({
  produitId: z.string().uuid(),
  quantite: z.number().positive(),
  prixUnitaire: z.number().positive(),
});

const creerBonSchema = z.object({
  activiteId: z.string().uuid(),
  fournisseurId: z.string().uuid(),
  lignes: z.array(ligneSchema).min(1),
});

const paiementSchema = z.object({
  montant: z.number().positive(),
  activiteId: z.string().uuid(),
});

export async function creer(req: Request, res: Response, next: NextFunction) {
  try {
    const body = creerBonSchema.parse(req.body);
    res.status(201).json(await creerBonCommande(body));
  } catch (err) {
    next(err);
  }
}

export async function lister(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listerBonsCommande(req.query.activiteId as string));
  } catch (err) {
    next(err);
  }
}

export async function reception(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await receptionnerBonCommande(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function paiement(req: Request, res: Response, next: NextFunction) {
  try {
    const body = paiementSchema.parse(req.body);
    res.status(201).json(
      await payerFacture({ ...body, factureId: req.params.id, saisiParId: req.user!.id })
    );
  } catch (err) {
    next(err);
  }
}
