import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/errorHandler";

const MAX_TENTATIVES = 5;
const DUREE_BLOCAGE_MINUTES = 5;

function verifierFormatPin(codePin: string) {
  if (!/^\d{4}$/.test(codePin)) {
    throw new AppError("Le code doit contenir exactement 4 chiffres.", 400);
  }
}

export async function definirCodePin(utilisateurId: string, codePin: string) {
  verifierFormatPin(codePin);

  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
  if (!utilisateur) throw new AppError("Utilisateur introuvable", 404);
  if (utilisateur.codePinHash) {
    throw new AppError("Un code est déjà configuré. Utilisez la modification.", 409);
  }

  const codePinHash = await bcrypt.hash(codePin, 10);
  await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: { codePinHash, pinTentativesEchouees: 0, pinBloqueJusqu: null },
  });

  return { pinConfigure: true };
}

export async function verifierCodePin(utilisateurId: string, codePin: string) {
  verifierFormatPin(codePin);

  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
  if (!utilisateur) throw new AppError("Utilisateur introuvable", 404);
  if (!utilisateur.codePinHash) throw new AppError("Aucun code configuré.", 409);

  if (utilisateur.pinBloqueJusqu && utilisateur.pinBloqueJusqu > new Date()) {
    const minutesRestantes = Math.ceil((utilisateur.pinBloqueJusqu.getTime() - Date.now()) / 60000);
    throw new AppError(
      `Trop de tentatives. Réessayez dans ${minutesRestantes} min ou reconnectez-vous avec votre mot de passe.`,
      423
    );
  }

  const valide = await bcrypt.compare(codePin, utilisateur.codePinHash);

  if (!valide) {
    const tentatives = utilisateur.pinTentativesEchouees + 1;
    const bloque = tentatives >= MAX_TENTATIVES;
    await prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        pinTentativesEchouees: bloque ? 0 : tentatives,
        pinBloqueJusqu: bloque ? new Date(Date.now() + DUREE_BLOCAGE_MINUTES * 60000) : null,
      },
    });
    if (bloque) {
      throw new AppError(
        `Trop de tentatives. Réessayez dans ${DUREE_BLOCAGE_MINUTES} min ou reconnectez-vous avec votre mot de passe.`,
        423
      );
    }
    throw new AppError("Code incorrect.", 401);
  }

  await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: { pinTentativesEchouees: 0, pinBloqueJusqu: null },
  });

  return { valide: true };
}

export async function modifierCodePin(utilisateurId: string, ancienCodePin: string, nouveauCodePin: string) {
  await verifierCodePin(utilisateurId, ancienCodePin); // réutilise la vérification + anti brute-force
  verifierFormatPin(nouveauCodePin);

  const codePinHash = await bcrypt.hash(nouveauCodePin, 10);
  await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: { codePinHash },
  });

  return { modifie: true };
}

// "Code oublié" : réinitialisation via le mot de passe du compte
export async function reinitialiserCodePinAvecMotDePasse(
  utilisateurId: string,
  motDePasse: string,
  nouveauCodePin: string
) {
  verifierFormatPin(nouveauCodePin);

  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
  if (!utilisateur) throw new AppError("Utilisateur introuvable", 404);

  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash);
  if (!motDePasseValide) throw new AppError("Mot de passe incorrect.", 401);

  const codePinHash = await bcrypt.hash(nouveauCodePin, 10);
  await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: { codePinHash, pinTentativesEchouees: 0, pinBloqueJusqu: null },
  });

  return { reinitialise: true };
}