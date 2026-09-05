import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/errorHandler";

const ROLES_VALIDES = ["ADMIN", "GERANT", "CAISSIER", "COMPTABLE"] as const;
type RoleValide = (typeof ROLES_VALIDES)[number];


export async function inscrire(nom: string, contact: string, motDePasse: string,role: RoleValide) {
  const existant = await prisma.utilisateur.findUnique({ where: { contact } });
  if (existant) throw new AppError("Un utilisateur avec ce contact existe déjà", 409);

  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  const utilisateur = await prisma.utilisateur.create({
    data: { nom, contact, motDePasseHash ,roleGlobal: role},
  });

  return { id: utilisateur.id, nom: utilisateur.nom, contact: utilisateur.contact };
}
export async function connecter(contact: string, motDePasse: string) {


  const utilisateur = await prisma.utilisateur.findUnique({ where: { contact } });
  if (!utilisateur) throw new AppError("Identifiants invalides", 401);

  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash);
  if (!motDePasseValide) throw new AppError("Identifiants invalides", 401);

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };

const token = jwt.sign(
  { id: utilisateur.id, roleGlobal: utilisateur.roleGlobal, tokenVersion: utilisateur.tokenVersion },
  process.env.JWT_SECRET as string,
  options
);
  return {
    token,
    utilisateur: {
      id: utilisateur.id,
      nom: utilisateur.nom,
      role: utilisateur.roleGlobal,
      pinConfigure: !!utilisateur.codePinHash, // ← ajouté
    },
  };}

  export async function deconnecter(userId: string) {
  await prisma.utilisateur.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
}