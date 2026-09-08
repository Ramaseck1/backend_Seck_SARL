import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  creerFinancement,
  listerFinancements,
  obtenirFinancement,
  enregistrerRemboursementFinancement,
} from "./financement.service";

const creerSchema = z.object({
  activiteId: z.string().uuid(),
  nom: z.string().min(1),
  prenom: z.string().min(1),
  telephone: z.string().min(6),
  montant: z.number().positive(),
});

const remboursementSchema = z
  .object({
    typePaiement: z.enum(["COMPLET", "PARTIEL"]),
    montant: z.number().positive().optional(),
  })
  .refine((d) => d.typePaiement === "COMPLET" || (d.montant && d.montant > 0), {
    message: "Le montant est requis pour un paiement partiel.",
    path: ["montant"],
  });

export async function creer(req: Request, res: Response, next: NextFunction) {
  try {
    const body = creerSchema.parse(req.body);
    res.status(201).json(await creerFinancement({ ...body, saisiParId: req.user!.id }));
  } catch (err) {
    next(err);
  }
}

export async function lister(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listerFinancements(req.query.activiteId as string));
  } catch (err) {
    next(err);
  }
}

export async function obtenir(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await obtenirFinancement(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function rembourser(req: Request, res: Response, next: NextFunction) {
  try {
    const body = remboursementSchema.parse(req.body);
    res.status(201).json(
      await enregistrerRemboursementFinancement({
        ...body,
        financementId: req.params.id,
        saisiParId: req.user!.id,
      })
    );
  } catch (err) {
    next(err);
  }
}