import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { creerFournisseur, listerFournisseurs } from "./fournisseurs.service";

const creerSchema = z.object({ nom: z.string().min(2), contact: z.string().optional() });

export async function creer(req: Request, res: Response, next: NextFunction) {
  try {
    const body = creerSchema.parse(req.body);
    res.status(201).json(await creerFournisseur(body.nom, body.contact));
  } catch (err) {
    next(err);
  }
}

export async function lister(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listerFournisseurs());
  } catch (err) {
    next(err);
  }
}
