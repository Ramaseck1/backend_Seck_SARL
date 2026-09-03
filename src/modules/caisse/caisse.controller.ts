import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { enregistrerMouvement, listerMouvements, soldeCaisse } from "./caisse.service";

const mouvementSchema = z.object({
  activiteId: z.string().uuid(),
  type: z.enum(["ENTREE", "SORTIE"]),
  montant: z.number().positive(),
  motif: z.string().min(2),
});

export async function creer(req: Request, res: Response, next: NextFunction) {
  try {
    const body = mouvementSchema.parse(req.body);
    res.status(201).json(await enregistrerMouvement({ ...body, saisiParId: req.user!.id }));
  } catch (err) {
    next(err);
  }
}

export async function lister(req: Request, res: Response, next: NextFunction) {
  try {
    const { activiteId, dateDebut, dateFin } = req.query as Record<string, string>;
    res.json(await listerMouvements(activiteId, dateDebut, dateFin));
  } catch (err) {
    next(err);
  }
}

export async function solde(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await soldeCaisse(req.query.activiteId as string));
  } catch (err) {
    next(err);
  }
}
