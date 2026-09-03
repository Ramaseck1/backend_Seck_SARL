"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const actifs_controller_1 = require("./actifs.controller");
const router = (0, express_1.Router)();
router.get("/", auth_1.requireAuth, actifs_controller_1.lister);
router.post("/", auth_1.requireAuth, actifs_controller_1.creer);
router.get("/:id/valeur-nette", auth_1.requireAuth, actifs_controller_1.valeurNette);
exports.default = router;
//# sourceMappingURL=actifs.routes.js.map