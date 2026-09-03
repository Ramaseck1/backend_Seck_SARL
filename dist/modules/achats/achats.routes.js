"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const achats_controller_1 = require("./achats.controller");
const router = (0, express_1.Router)();
router.get("/bons-commande", auth_1.requireAuth, achats_controller_1.lister);
router.post("/bons-commande", auth_1.requireAuth, achats_controller_1.creer);
router.post("/bons-commande/:id/reception", auth_1.requireAuth, achats_controller_1.reception);
router.post("/factures/:id/paiements", auth_1.requireAuth, achats_controller_1.paiement);
exports.default = router;
//# sourceMappingURL=achats.routes.js.map