"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const caisse_controller_1 = require("./caisse.controller");
const router = (0, express_1.Router)();
router.get("/mouvements", auth_1.requireAuth, caisse_controller_1.lister);
router.post("/mouvements", auth_1.requireAuth, caisse_controller_1.creer);
router.get("/solde", auth_1.requireAuth, caisse_controller_1.solde);
exports.default = router;
//# sourceMappingURL=caisse.routes.js.map