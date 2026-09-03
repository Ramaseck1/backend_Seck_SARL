"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const fournisseurs_controller_1 = require("./fournisseurs.controller");
const router = (0, express_1.Router)();
router.get("/", auth_1.requireAuth, fournisseurs_controller_1.lister);
router.post("/", auth_1.requireAuth, fournisseurs_controller_1.creer);
exports.default = router;
//# sourceMappingURL=fournisseurs.routes.js.map