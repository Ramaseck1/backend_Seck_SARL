"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const financement_controller_1 = require("./financement.controller");
const router = (0, express_1.Router)();
router.get("/", auth_1.requireAuth, financement_controller_1.lister);
router.get("/:id", auth_1.requireAuth, financement_controller_1.obtenir);
router.post("/", auth_1.requireAuth, financement_controller_1.creer);
router.post("/:id/remboursements", auth_1.requireAuth, financement_controller_1.rembourser);
exports.default = router;
//# sourceMappingURL=financement.router.js.map