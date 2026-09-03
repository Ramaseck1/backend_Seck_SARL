"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const rh_controller_1 = require("./rh.controller");
const router = (0, express_1.Router)();
router.get("/employes", auth_1.requireAuth, rh_controller_1.lister);
router.post("/employes", auth_1.requireAuth, rh_controller_1.creer);
router.post("/employes/:id/presences", auth_1.requireAuth, rh_controller_1.presence);
router.post("/bulletins", auth_1.requireAuth, rh_controller_1.bulletin);
exports.default = router;
//# sourceMappingURL=rh.routes.js.map