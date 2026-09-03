import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  creerClient,
  listerClients,
  obtenirClient,
  soldesParActivite,
  modifierClient,
  supprimerClient,
  supprimerClients,
  NomClientDupliqueError,
  ClientIntrouvableError,
  ClientLieError,
} from "./clients.service";

const creerSchema = z.object({
  nom: z.string().min(2),
  contact: z.string().optional(),
});

const modifierSchema = z.object({
  nom: z.string().min(2),
  contact: z.string().optional(),
});

const supprimerPlusieursSchema = z.object({
  ids: z.array(z.string()).min(1),
});

function gererErreurClient(err: any, res: Response, next: NextFunction) {
  if (err instanceof NomClientDupliqueError) {
    return res.status(409).json({ error: err.message });
  }
  if (err instanceof ClientIntrouvableError) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof ClientLieError) {
    return res.status(409).json({ error: err.message });
  }
  next(err);
}

export async function creer(req: Request, res: Response, next: NextFunction) {
  try {
    const body = creerSchema.parse(req.body);
    res.status(201).json(await creerClient(body.nom, body.contact));
  } catch (err) {
    gererErreurClient(err, res, next);
  }
}

export async function modifier(req: Request, res: Response, next: NextFunction) {
  try {
    const body = modifierSchema.parse(req.body);
    res.json(await modifierClient(req.params.id, body.nom, body.contact));
  } catch (err) {
    gererErreurClient(err, res, next);
  }
}

export async function supprimer(req: Request, res: Response, next: NextFunction) {
  try {
    await supprimerClient(req.params.id);
    res.status(204).send();
  } catch (err) {
    gererErreurClient(err, res, next);
  }
}

export async function supprimerPlusieurs(req: Request, res: Response, next: NextFunction) {
  try {
    const body = supprimerPlusieursSchema.parse(req.body);
    const resultats = await supprimerClients(body.ids);
    res.json({ resultats });
  } catch (err) {
    next(err);
  }
}

export async function lister(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listerClients(req.query.q as string | undefined));
  } catch (err) {
    next(err);
  }
}

export async function obtenir(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await obtenirClient(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function soldes(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await soldesParActivite(req.params.id));
  } catch (err) {
    next(err);
  }
}