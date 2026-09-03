"use strict";
// src/modules/currency/currency.service.ts
//
// Service réutilisable de conversion de devises.
// Source : open.er-api.com (gratuit, sans clé API, mise à jour quotidienne).
// Un cache en mémoire évite d'appeler l'API à chaque requête.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversionDeviseError = void 0;
exports.obtenirTaux = obtenirTaux;
exports.convertirMontant = convertirMontant;
exports.convertirGMDversFCFA = convertirGMDversFCFA;
const CACHE_DUREE_MS = 60 * 60 * 1000; // 1h — largement suffisant vu que la source se met à jour 1x/jour
const cacheTaux = new Map();
class ConversionDeviseError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConversionDeviseError";
    }
}
exports.ConversionDeviseError = ConversionDeviseError;
async function recupererTauxDepuisApi(deviseBase) {
    const url = `https://open.er-api.com/v6/latest/${deviseBase}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new ConversionDeviseError(`Impossible de récupérer les taux de change (statut ${response.status}).`);
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
async function obtenirTaux(de, vers) {
    const deviseDe = de.toUpperCase();
    const deviseVers = vers.toUpperCase();
    const cleCache = `${deviseDe}_${deviseVers}`;
    const entreeCache = cacheTaux.get(cleCache);
    const estValide = entreeCache && Date.now() - entreeCache.recupereLe.getTime() < CACHE_DUREE_MS;
    if (estValide) {
        return entreeCache.taux;
    }
    const rates = await recupererTauxDepuisApi(deviseDe);
    const taux = rates[deviseVers];
    if (taux === undefined) {
        throw new ConversionDeviseError(`Taux de change introuvable pour la paire ${deviseDe}/${deviseVers}.`);
    }
    cacheTaux.set(cleCache, { taux, recupereLe: new Date() });
    return taux;
}
/**
 * Convertit un montant d'une devise vers une autre.
 * Ex: convertirMontant(1000, "GMD", "XOF")
 */
async function convertirMontant(montant, de, vers) {
    const taux = await obtenirTaux(de, vers);
    const cleCache = `${de.toUpperCase()}_${vers.toUpperCase()}`;
    const recupereLe = cacheTaux.get(cleCache).recupereLe;
    return {
        montantConverti: montant * taux,
        taux,
        recupereLe,
    };
}
// Raccourci pratique pour le cas d'usage principal de l'app : GMD -> XOF (dalasi -> FCFA)
async function convertirGMDversFCFA(montantEnDalasi) {
    return convertirMontant(montantEnDalasi, "GMD", "XOF");
}
//# sourceMappingURL=currency.service.js.map