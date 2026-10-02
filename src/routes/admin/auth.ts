import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";

export const authRouter = Router();

authRouter.get("/login", (req: Request, res: Response) => {
  if (req.session.isAdmin) {
    res.redirect("/admin");
    return;
  }
  res.render("admin/login", {
    title: "Admin Login — Agrahari Gas",
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

  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  const renderError = () =>
    res.status(401).render("admin/login", {
      title: "Admin Login — Agrahari Gas",
      error: "Invalid username or password.",
      next: next ?? "/admin",
    });

  if (!adminPasswordHash) {
    res.status(500).render("admin/login", {
      title: "Admin Login — Agrahari Gas",
      error:
        "Admin login isn't configured yet. Run 'npm run admin:hash -- <password>' and add ADMIN_PASSWORD_HASH to .env.",
      next: next ?? "/admin",
    });
    return;
  }

  if (!username || !password || username !== adminUsername) {
    renderError();
    return;
  }

  const valid = await bcrypt.compare(password, adminPasswordHash);
  if (!valid) {
    renderError();
    return;
  }

  req.session.isAdmin = true;
  req.session.adminUsername = username;
  res.redirect(next && next.startsWith("/admin") ? next : "/admin");
});

authRouter.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});
