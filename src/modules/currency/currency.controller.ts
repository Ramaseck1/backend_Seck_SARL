import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { convertirMontant, obtenirTaux, ConversionDeviseError } from "./currency.service";

const convertirSchema = z.object({
  montant: z.coerce.number(),
  de: z.string().length(3).default("GMD"),
  vers: z.string().length(3).default("XOF"),
});

export async function convertir(req: Request, res: Response, next: NextFunction) {
  try {
    const query = convertirSchema.parse(req.query);
    const resultat = await convertirMontant(query.montant, query.de, query.vers);
    res.json(resultat);
  } catch (err) {
    if (err instanceof ConversionDeviseError) {
      return res.status(502).json({ error: err.message });
    }
    next(err);
  }
}

export async function taux(req: Request, res: Response, next: NextFunction) {
  try {
    const de = ((req.query.de as string) || "GMD").toUpperCase();
    const vers = ((req.query.vers as string) || "XOF").toUpperCase();
    const valeur = await obtenirTaux(de, vers);
    res.json({ de, vers, taux: valeur });
  } catch (err) {
    if (err instanceof ConversionDeviseError) {
      return res.status(502).json({ error: err.message });
    }
    next(err);
  }
}