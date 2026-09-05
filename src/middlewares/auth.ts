import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import { prisma } from "../lib/prisma"; // ajustez si le chemin réel diffère

export interface AuthPayload {
  id: string;
  roleGlobal: string;
  tokenVersion: number; // ← ajouté
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Authentification requise", 401));
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;

    const utilisateur = await prisma.utilisateur.findUnique({ where: { id: payload.id } });
    if (!utilisateur || utilisateur.tokenVersion !== payload.tokenVersion) {
      return next(new AppError("Session expirée, veuillez vous reconnecter", 401));
    }

    req.user = {
      id: utilisateur.id,
      roleGlobal: utilisateur.roleGlobal,
      tokenVersion: utilisateur.tokenVersion,
    };
    next();
  } catch {
    next(new AppError("Token invalide ou expiré", 401));
  }
}