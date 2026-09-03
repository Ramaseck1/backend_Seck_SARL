"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const credits_controller_1 = require("./credits.controller");
const router = (0, express_1.Router)();
router.post("/remboursements", auth_1.requireAuth, credits_controller_1.rembourser);
router.get("/en-retard", auth_1.requireAuth, credits_controller_1.enRetard);
router.get("/client/:clientId", auth_1.requireAuth, credits_controller_1.parClient);
exports.default = router;
//# sourceMappingURL=credits.routes.js.map