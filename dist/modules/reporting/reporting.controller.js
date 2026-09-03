"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalier = journalier;
exports.consolide = consolide;
const reporting_service_1 = require("./reporting.service");
async function journalier(req, res, next) {
    try {
        const { activiteId, date } = req.query;
        res.json(await (0, reporting_service_1.rapportJournalier)(activiteId, date));
    }
    catch (err) {
        next(err);
    }
}
async function consolide(_req, res, next) {
    try {
        res.json(await (0, reporting_service_1.rapportConsolide)());
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=reporting.controller.js.map