"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const currency_controller_1 = require("./currency.controller");
const router = (0, express_1.Router)();
router.get("/taux", auth_1.requireAuth, currency_controller_1.taux);
router.get("/convertir", auth_1.requireAuth, currency_controller_1.convertir);
exports.default = router;
//# sourceMappingURL=currency.routes.js.map