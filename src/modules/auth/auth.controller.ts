import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { connecter, inscrire } from "./auth.service";

const inscrireSchema = z.object({
  nom: z.string().min(2),
  contact: z.string().min(6),
  motDePasse: z.string().min(6),
});

const connecterSchema = z.object({
  contact: z.string().min(6),
  motDePasse: z.string().min(6),
});

export async function inscription(req: Request, res: Response, next: NextFunction) {
  try {
    const body = inscrireSchema.parse(req.body);
    const utilisateur = await inscrire(body.nom, body.contact, body.motDePasse);
    res.status(201).json(utilisateur);
  } catch (err) {
    next(err);
  }
}

export async function connexion(req: Request, res: Response, next: NextFunction) {
  try {
    const body = connecterSchema.parse(req.body);
    const result = await connecter(body.contact, body.motDePasse);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
