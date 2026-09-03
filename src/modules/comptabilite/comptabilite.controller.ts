import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  calculerBilan,
  creerCompte,
  creerEcriture,
  listerComptes,
  listerEcritures,
} from "./comptabilite.service";

const creerCompteSchema = z.object({
  code: z.string().min(1),
  libelle: z.string().min(2),
  type: z.enum(["ACTIF", "PASSIF", "CHARGE", "PRODUIT", "CAPITAUX"]),
});

const ligneSchema = z.object({
  compteId: z.string().uuid(),
  sens: z.enum(["DEBIT", "CREDIT"]),
  montant: z.number().positive(),
});

const creerEcritureSchema = z.object({
  activiteId: z.string().uuid(),
  journal: z.string().min(2),
  libelle: z.string().min(2),
  reference: z.string().optional(),
  lignes: z.array(ligneSchema).min(2),
});

export async function comptes(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listerComptes());
  } catch (err) {
    next(err);
  }
}

export async function creerCompteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = creerCompteSchema.parse(req.body);
    res.status(201).json(await creerCompte(body.code, body.libelle, body.type));
  } catch (err) {
    next(err);
  }
}

export async function ecritures(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listerEcritures(req.query.activiteId as string));
  } catch (err) {
    next(err);
  }
}

export async function creerEcritureHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = creerEcritureSchema.parse(req.body);
    res.status(201).json(await creerEcriture({ ...body, saisiParId: req.user!.id }));
  } catch (err) {
    next(err);
  }
}

export async function bilan(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await calculerBilan(req.query.activiteId as string | undefined));
  } catch (err) {
    next(err);
  }
}
