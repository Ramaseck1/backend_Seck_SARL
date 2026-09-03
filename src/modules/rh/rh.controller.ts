import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { creerEmploye, enregistrerPresence, genererBulletin, listerEmployes } from "./rh.service";

const creerEmployeSchema = z.object({
  activiteId: z.string().uuid(),
  nom: z.string().min(2),
  poste: z.string().min(2),
  salaireBase: z.number().positive(),
  contact: z.string().optional(),
});

const presenceSchema = z.object({
  date: z.string(),
  present: z.boolean(),
  heures: z.number().nonnegative().default(0),
});

const bulletinSchema = z.object({
  employeId: z.string().uuid(),
  mois: z.number().int().min(1).max(12),
  annee: z.number().int().min(2000),
  deductions: z.number().nonnegative().optional(),
});

export async function creer(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await creerEmploye(creerEmployeSchema.parse(req.body)));
  } catch (err) {
    next(err);
  }
}

export async function lister(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listerEmployes(req.query.activiteId as string));
  } catch (err) {
    next(err);
  }
}

export async function presence(req: Request, res: Response, next: NextFunction) {
  try {
    const body = presenceSchema.parse(req.body);
    res.status(201).json(await enregistrerPresence(req.params.id, body.date, body.present, body.heures));
  } catch (err) {
    next(err);
  }
}

export async function bulletin(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await genererBulletin(bulletinSchema.parse(req.body)));
  } catch (err) {
    next(err);
  }
}
