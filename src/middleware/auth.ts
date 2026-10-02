import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session.isAdmin) {
    next();
    return;
  }
  res.redirect(`/admin/login?next=${encodeURIComponent(req.originalUrl)}`);
}
