"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const pin_controller_1 = require("../pin/pin.controller");
const auth_1 = require("../../middlewares/auth"); // ⚠️ vérifiez le chemin réel de votre fichier auth.ts
const router = (0, express_1.Router)();
router.post("/inscription", auth_controller_1.inscription);
router.post("/connexion", auth_controller_1.connexion);
router.post("/pin/definir", auth_1.requireAuth, pin_controller_1.definir);
router.post("/pin/verifier", auth_1.requireAuth, pin_controller_1.verifier);
router.put("/pin/modifier", auth_1.requireAuth, pin_controller_1.modifier);
router.post("/pin/reinitialiser", auth_1.requireAuth, pin_controller_1.reinitialiser);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map