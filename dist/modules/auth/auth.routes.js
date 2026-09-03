"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post("/inscription", auth_controller_1.inscription);
router.post("/connexion", auth_controller_1.connexion);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map