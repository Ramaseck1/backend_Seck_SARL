"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const comptabilite_controller_1 = require("./comptabilite.controller");
const router = (0, express_1.Router)();
router.get("/comptes", auth_1.requireAuth, comptabilite_controller_1.comptes);
router.post("/comptes", auth_1.requireAuth, comptabilite_controller_1.creerCompteHandler);
router.get("/ecritures", auth_1.requireAuth, comptabilite_controller_1.ecritures);
router.post("/ecritures", auth_1.requireAuth, comptabilite_controller_1.creerEcritureHandler);
router.get("/bilan", auth_1.requireAuth, comptabilite_controller_1.bilan);
exports.default = router;
//# sourceMappingURL=comptabilite.routes.js.map