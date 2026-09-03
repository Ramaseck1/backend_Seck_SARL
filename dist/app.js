"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const activites_routes_1 = __importDefault(require("./modules/activites/activites.routes"));
const achats_routes_1 = __importDefault(require("./modules/achats/achats.routes"));
const actifs_routes_1 = __importDefault(require("./modules/actifs/actifs.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const caisse_routes_1 = __importDefault(require("./modules/caisse/caisse.routes"));
const clients_routes_1 = __importDefault(require("./modules/clients/clients.routes"));
const comptabilite_routes_1 = __importDefault(require("./modules/comptabilite/comptabilite.routes"));
const credits_routes_1 = __importDefault(require("./modules/credits/credits.routes"));
const fournisseurs_routes_1 = __importDefault(require("./modules/fournisseurs/fournisseurs.routes"));
const produits_routes_1 = __importDefault(require("./modules/produits/produits.routes"));
const reporting_routes_1 = __importDefault(require("./modules/reporting/reporting.routes"));
const rh_routes_1 = __importDefault(require("./modules/rh/rh.routes"));
const ventes_routes_1 = __importDefault(require("./modules/ventes/ventes.routes"));
const currency_routes_1 = __importDefault(require("./modules/currency/currency.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
// Documentation API — servie depuis swagger.yaml à la racine du projet,
// séparé du code pour rester maintenable indépendamment du backend.
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, "..", "swagger.yaml"));
exports.app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// ---- V1 : socle transactionnel quotidien ----
exports.app.use("/api/auth", auth_routes_1.default);
exports.app.use("/api/activites", activites_routes_1.default);
exports.app.use("/api/clients", clients_routes_1.default);
exports.app.use("/api/produits", produits_routes_1.default);
exports.app.use("/api/ventes", ventes_routes_1.default);
exports.app.use("/api/credits", credits_routes_1.default);
exports.app.use("/api/caisse", caisse_routes_1.default);
exports.app.use("/api/currency", currency_routes_1.default);
// ---- V2 : comptabilité, achats, RH, actifs ----
exports.app.use("/api/fournisseurs", fournisseurs_routes_1.default);
exports.app.use("/api/achats", achats_routes_1.default);
exports.app.use("/api/comptabilite", comptabilite_routes_1.default);
exports.app.use("/api/rh", rh_routes_1.default);
exports.app.use("/api/actifs", actifs_routes_1.default);
exports.app.use("/api/reporting", reporting_routes_1.default);
exports.app.get("/health", (_req, res) => res.json({ status: "ok" }));
exports.app.use(errorHandler_1.errorHandler);
//# sourceMappingURL=app.js.map