import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { creerActif, listerActifs, valeurNetteComptable } from "./actifs.service";

const creerSchema = z.object({
  activiteId: z.string().uuid(),
  nom: z.string().min(2),
  valeurAcquisition: z.number().positive(),
  dateAcquisition: z.string(),
  dureeAmortissement: z.number().int().positive(),
});

export async function creer(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await creerActif(creerSchema.parse(req.body)));
  } catch (err) {
    next(err);
  }
}

export async function lister(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listerActifs(req.query.activiteId as string));
  } catch (err) {
    next(err);
  }
}

export async function valeurNette(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await valeurNetteComptable(req.params.id));
  } catch (err) {
    next(err);
  }
}
