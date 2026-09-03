"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const produits_controller_1 = require("./produits.controller");
const router = (0, express_1.Router)();
router.get("/", auth_1.requireAuth, produits_controller_1.lister);
router.get("/alertes", auth_1.requireAuth, produits_controller_1.alertes);
router.get("/:id/bilan", auth_1.requireAuth, produits_controller_1.bilan);
router.post("/", auth_1.requireAuth, produits_controller_1.creer);
router.patch("/:id/stock", auth_1.requireAuth, produits_controller_1.ajuster);
exports.default = router;
//# sourceMappingURL=produits.routes.js.map