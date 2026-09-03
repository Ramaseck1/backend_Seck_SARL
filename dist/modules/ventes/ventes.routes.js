"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const ventes_controller_1 = require("./ventes.controller");
const router = (0, express_1.Router)();
router.post("/", auth_1.requireAuth, ventes_controller_1.creer);
router.get("/", auth_1.requireAuth, ventes_controller_1.lister);
exports.default = router;
//# sourceMappingURL=ventes.routes.js.map