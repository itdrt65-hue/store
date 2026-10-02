import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import {
  getAdminCredentials,
  setAdminCredentials,
  validateNewLogin,
  isThrottled,
  recordFailure,
  clearFailures,
} from "../../admin-account";

export const authRouter = Router();

const TITLE = "Admin Login — Agrahari Gas";

function sameSecret(given: string, expected: string): boolean {
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

authRouter.get("/login", (req: Request, res: Response) => {
  if (req.session.isAdmin) {
    res.redirect("/admin");
    return;
  }
  res.render("admin/login", {
    title: TITLE,
    error: null,
    next: typeof req.query.next === "string" ? req.query.next : "/admin",
  });
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { username, password, next } = req.body as {
    username?: string;
    password?: string;
    next?: string;
  };

  const renderError = (status: number, error: string) =>
    res.status(status).render("admin/login", {
      title: TITLE,
      error,
      next: next ?? "/admin",
    });

  const creds = await getAdminCredentials();
  if (!creds) {
    renderError(
      500,
      process.env.ADMIN_SETUP_TOKEN
        ? "Admin login isn't set up yet. Go to /admin/setup to create it."
        : "Admin login isn't set up yet. Set ADMIN_SETUP_TOKEN on the server, then open /admin/setup.",
    );
    return;
  }

  const throttleKey = `login:${req.ip}`;
  if (isThrottled(throttleKey)) {
    renderError(429, "Too many failed attempts. Try again in a few minutes.");
    return;
  }

  const valid =
    !!username && !!password && username === creds.username && (await bcrypt.compare(password, creds.passwordHash));
  if (!valid) {
    recordFailure(throttleKey);
    renderError(401, "Invalid username or password.");
    return;
  }

  clearFailures(throttleKey);
  req.session.isAdmin = true;
  req.session.adminUsername = username;
  res.redirect(next && next.startsWith("/admin") ? next : "/admin");
});

// Server-side setup / reset. Only available when ADMIN_SETUP_TOKEN is set on the
// server, and every request must present that token.
authRouter.get("/setup", (req: Request, res: Response) => {
  res.render("admin/setup", {
    title: "Admin Setup — Agrahari Gas",
    enabled: !!process.env.ADMIN_SETUP_TOKEN,
    error: null,
    username: "",
  });
});

authRouter.post("/setup", async (req: Request, res: Response) => {
  const token = process.env.ADMIN_SETUP_TOKEN;
  const body = req.body as Record<string, string | undefined>;
  const username = (body.username ?? "").trim();
  const renderError = (status: number, error: string) =>
    res.status(status).render("admin/setup", {
      title: "Admin Setup — Agrahari Gas",
      enabled: !!token,
      error,
      username,
    });

  if (!token) {
    renderError(403, "Setup is disabled.");
    return;
  }

  const throttleKey = `setup:${req.ip}`;
  if (isThrottled(throttleKey, 5)) {
    renderError(429, "Too many failed attempts. Try again in a few minutes.");
    return;
  }
  if (!sameSecret(body.token ?? "", token)) {
    recordFailure(throttleKey);
    renderError(401, "Setup token is incorrect.");
    return;
  }

  const problem = validateNewLogin(username, body.password ?? "", body.confirm ?? "");
  if (problem) {
    renderError(400, problem);
    return;
  }

  clearFailures(throttleKey);
  await setAdminCredentials(username, body.password!);
  req.session.isAdmin = true;
  req.session.adminUsername = username;
  res.redirect("/admin");
});

authRouter.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});
