"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const reporting_controller_1 = require("./reporting.controller");
const router = (0, express_1.Router)();
router.get("/journalier", auth_1.requireAuth, reporting_controller_1.journalier);
router.get("/consolide", auth_1.requireAuth, reporting_controller_1.consolide);
exports.default = router;
//# sourceMappingURL=reporting.routes.js.map