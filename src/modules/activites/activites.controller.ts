import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { creerActivite, listerActivites, obtenirActivite } from "./activites.service";

const creerSchema = z.object({
  nom: z.string().min(2),
  uniteMesure: z.string().min(1),
});

export async function creer(req: Request, res: Response, next: NextFunction) {
  try {
    const body = creerSchema.parse(req.body);
    const activite = await creerActivite(body.nom, body.uniteMesure);
    res.status(201).json(activite);
  } catch (err) {
    next(err);
  }
}

export async function lister(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listerActivites());
  } catch (err) {
    next(err);
  }
}

export async function obtenir(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await obtenirActivite(req.params.id));
  } catch (err) {
    next(err);
  }
}
