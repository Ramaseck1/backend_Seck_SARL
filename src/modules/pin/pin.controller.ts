import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  definirCodePin,
  verifierCodePin,
  modifierCodePin,
  reinitialiserCodePinAvecMotDePasse,
} from "./pin.service";

const codePinSchema = z.object({ codePin: z.string().length(4).regex(/^\d{4}$/) });
const modifierPinSchema = z.object({
  ancienCodePin: z.string().length(4).regex(/^\d{4}$/),
  nouveauCodePin: z.string().length(4).regex(/^\d{4}$/),
});
const reinitialiserPinSchema = z.object({
  motDePasse: z.string().min(6),
  nouveauCodePin: z.string().length(4).regex(/^\d{4}$/),
});

export async function definir(req: Request, res: Response, next: NextFunction) {
  try {
    const { codePin } = codePinSchema.parse(req.body);
    const result = await definirCodePin(req.user!.id, codePin);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function verifier(req: Request, res: Response, next: NextFunction) {
  try {
    const { codePin } = codePinSchema.parse(req.body);
    const result = await verifierCodePin(req.user!.id, codePin);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function modifier(req: Request, res: Response, next: NextFunction) {
  try {
    const { ancienCodePin, nouveauCodePin } = modifierPinSchema.parse(req.body);
    const result = await modifierCodePin(req.user!.id, ancienCodePin, nouveauCodePin);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function reinitialiser(req: Request, res: Response, next: NextFunction) {
  try {
    const { motDePasse, nouveauCodePin } = reinitialiserPinSchema.parse(req.body);
    const result = await reinitialiserCodePinAvecMotDePasse(req.user!.id, motDePasse, nouveauCodePin);
    res.json(result);
  } catch (err) {
    next(err);
  }
}