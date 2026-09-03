// src/modules/currency/currency.service.ts
//
// Service réutilisable de conversion de devises.
// Source : open.er-api.com (gratuit, sans clé API, mise à jour quotidienne).
// Un cache en mémoire évite d'appeler l'API à chaque requête.

interface TauxCache {
  taux: number;
  recupereLe: Date;
}

const CACHE_DUREE_MS = 60 * 60 * 1000; // 1h — largement suffisant vu que la source se met à jour 1x/jour
const cacheTaux = new Map<string, TauxCache>();

export class ConversionDeviseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConversionDeviseError";
  }
}

async function recupererTauxDepuisApi(deviseBase: string): Promise<Record<string, number>> {
  const url = `https://open.er-api.com/v6/latest/${deviseBase}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new ConversionDeviseError(
      `Impossible de récupérer les taux de change (statut ${response.status}).`
    );
  }

  const data = await response.json();

  if (data.result !== "success") {
    throw new ConversionDeviseError("La source de taux de change a renvoyé une erreur.");
  }

  return data.rates;
}

/**
 * Retourne le taux de conversion de `de` vers `vers` (ex: "GMD" -> "XOF").
 * Utilise un cache en mémoire d'1h pour limiter les appels réseau.
 */
export async function obtenirTaux(de: string, vers: string): Promise<number> {
  const deviseDe = de.toUpperCase();
  const deviseVers = vers.toUpperCase();
  const cleCache = `${deviseDe}_${deviseVers}`;

  const entreeCache = cacheTaux.get(cleCache);
  const estValide =
    entreeCache && Date.now() - entreeCache.recupereLe.getTime() < CACHE_DUREE_MS;

  if (estValide) {
    return entreeCache!.taux;
  }

  const rates = await recupererTauxDepuisApi(deviseDe);
  const taux = rates[deviseVers];

  if (taux === undefined) {
    throw new ConversionDeviseError(
      `Taux de change introuvable pour la paire ${deviseDe}/${deviseVers}.`
    );
  }

  cacheTaux.set(cleCache, { taux, recupereLe: new Date() });
  return taux;
}

/**
 * Convertit un montant d'une devise vers une autre.
 * Ex: convertirMontant(1000, "GMD", "XOF")
 */
export async function convertirMontant(
  montant: number,
  de: string,
  vers: string
): Promise<{ montantConverti: number; taux: number; recupereLe: Date }> {
  const taux = await obtenirTaux(de, vers);
  const cleCache = `${de.toUpperCase()}_${vers.toUpperCase()}`;
  const recupereLe = cacheTaux.get(cleCache)!.recupereLe;

  return {
    montantConverti: montant * taux,
    taux,
    recupereLe,
  };
}

// Raccourci pratique pour le cas d'usage principal de l'app : GMD -> XOF (dalasi -> FCFA)
export async function convertirGMDversFCFA(montantEnDalasi: number) {
  return convertirMontant(montantEnDalasi, "GMD", "XOF");
}