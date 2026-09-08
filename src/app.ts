import cors from "cors";
import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import activitesRoutes from "./modules/activites/activites.routes";
import achatsRoutes from "./modules/achats/achats.routes";
import actifsRoutes from "./modules/actifs/actifs.routes";
import authRoutes from "./modules/auth/auth.routes";
import caisseRoutes from "./modules/caisse/caisse.routes";
import clientsRoutes from "./modules/clients/clients.routes";
import comptabiliteRoutes from "./modules/comptabilite/comptabilite.routes";
import creditsRoutes from "./modules/credits/credits.routes";
import fournisseursRoutes from "./modules/fournisseurs/fournisseurs.routes";
import produitsRoutes from "./modules/produits/produits.routes";
import reportingRoutes from "./modules/reporting/reporting.routes";
import rhRoutes from "./modules/rh/rh.routes";
import ventesRoutes from "./modules/ventes/ventes.routes";
import financementRouter from "./modules/finances/financement.router";
import currencyRoutes from "./modules/currency/currency.routes";

import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

app.use(cors());
app.use(express.json());

// Documentation API — servie depuis swagger.yaml à la racine du projet,
// séparé du code pour rester maintenable indépendamment du backend.
const swaggerDocument = YAML.load(path.join(__dirname, "..", "swagger.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ---- V1 : socle transactionnel quotidien ----
app.use("/api/auth", authRoutes);
app.use("/api/activites", activitesRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/produits", produitsRoutes);
app.use("/api/ventes", ventesRoutes);
app.use("/api/credits", creditsRoutes);
app.use("/api/caisse", caisseRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/financements", financementRouter)

// ---- V2 : comptabilité, achats, RH, actifs ----
app.use("/api/fournisseurs", fournisseursRoutes);
app.use("/api/achats", achatsRoutes);
app.use("/api/comptabilite", comptabiliteRoutes);
app.use("/api/rh", rhRoutes);
app.use("/api/actifs", actifsRoutes);
app.use("/api/reporting", reportingRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);
