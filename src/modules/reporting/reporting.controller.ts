import { NextFunction, Request, Response } from "express";
import { rapportConsolide, rapportJournalier } from "./reporting.service";

export async function journalier(req: Request, res: Response, next: NextFunction) {
  try {
    const { activiteId, date } = req.query as Record<string, string>;
    res.json(await rapportJournalier(activiteId, date));
  } catch (err) {
    next(err);
  }
}

export async function consolide(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await rapportConsolide());
  } catch (err) {
    next(err);
  }
}
