import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { enregistrerRemboursement, listerCreancesEnRetard, listerCreditsClient } from "./credits.service";
import { log } from "node:console";

const remboursementSchema = z.object({
  creditId: z.string().uuid(),
  montant: z.number().positive(),
});

export async function rembourser(req: Request, res: Response, next: NextFunction) {
  try {
    const body = remboursementSchema.parse(req.body);
    const remboursement = await enregistrerRemboursement({ ...body, saisiParId: req.user!.id });
    res.status(201).json(remboursement);
  } catch (err) {
    next(err);
  }
}

export async function enRetard(req: Request, res: Response, next: NextFunction) {
  try {
    const activiteId = req.query.activiteId as string | undefined;
    const creances = await listerCreancesEnRetard(activiteId);
    console.log("creances",creances);
    
    res.json(creances);
  } catch (err) {
    next(err);
  }
}

export async function parClient(req: Request, res: Response, next: NextFunction) {
  try {
    const credits = await listerCreditsClient(req.params.clientId);
    res.json(credits);
  } catch (err) {
    next(err);
  }
}
