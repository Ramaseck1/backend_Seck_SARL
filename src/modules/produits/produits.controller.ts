import {
  NextFunction,
  Request,
  Response,
} from "express";

import { z } from "zod";

import {
  ajusterStock,
  creerProduit,
  listerProduits,
  produitsEnAlerte,
  obtenirBilanProduit,
} from "./produits.service";

const creerSchema = z.object({

  activiteId:
    z.string().uuid(),

  nom:
    z.string().min(2).optional(),  // ← ajouter .optional()

  prixAchatUnitaire:
    z.number().positive(),

  prixUnitaire:
    z.number().positive(),

  quantiteStock:
    z.number().nonnegative(),

  seuilAlerte:
    z.number()
      .nonnegative()
      .optional(),

  dateAchat:
    z.string()
      .datetime()
      .optional(),
});

const ajustementSchema = z.object({

  delta:
    z.number(),

  motif:
    z.string().min(2),

  prixAchatUnitaire:
    z.number()
      .positive()
      .optional(),
});


export async function creer(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const body =
      creerSchema.parse(req.body);

    const produit =
      await creerProduit({
        ...body,

        dateAchat:
          body.dateAchat
            ? new Date(body.dateAchat)
            : undefined,
      });

    res
      .status(201)
      .json(produit);

  } catch (err) {
    next(err);
  }
}


export async function lister(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const activiteId =
      req.query.activiteId as string;

    res.json(
      await listerProduits(
        activiteId
      )
    );

  } catch (err) {
    next(err);
  }
}


export async function ajuster(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const body =
      ajustementSchema.parse(
        req.body
      );

    const produit =
      await ajusterStock({
        produitId:
          req.params.id,

        delta:
          body.delta,

        motif:
          body.motif,

        prixAchatUnitaire:
          body.prixAchatUnitaire,
      });

    res.json(produit);

  } catch (err) {
    next(err);
  }
}


export async function alertes(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const activiteId =
      req.query.activiteId as string;

    res.json(
      await produitsEnAlerte(
        activiteId
      )
    );

  } catch (err) {
    next(err);
  }
}


export async function bilan(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const result =
      await obtenirBilanProduit(
        req.params.id
      );

    res.json(result);

  } catch (err) {
    next(err);
  }
}