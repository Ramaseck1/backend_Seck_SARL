"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const activites_controller_1 = require("./activites.controller");
const router = (0, express_1.Router)();
router.get("/", auth_1.requireAuth, activites_controller_1.lister);
router.get("/:id", auth_1.requireAuth, activites_controller_1.obtenir);
router.post("/", auth_1.requireAuth, activites_controller_1.creer);
exports.default = router;
//# sourceMappingURL=activites.routes.js.map