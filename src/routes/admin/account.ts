import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getAdminCredentials, setAdminCredentials, validateNewLogin } from "../../admin-account";

export const accountRouter = Router();

accountRouter.get("/", async (req: Request, res: Response) => {
  const creds = await getAdminCredentials();
  res.render("admin/account", {
    title: "Account — Admin",
    active: "more",
    username: creds?.username ?? "",
    error: null,
    msg: req.query.msg ?? null,
  });
});

accountRouter.post("/", async (req: Request, res: Response) => {
  const body = req.body as Record<string, string | undefined>;
  const creds = await getAdminCredentials();
  const username = (body.username ?? "").trim();

  const renderError = (status: number, error: string) =>
    res.status(status).render("admin/account", {
      title: "Account — Admin",
      active: "more",
      username,
      error,
      msg: null,
    });

  if (!creds || !(await bcrypt.compare(body.current ?? "", creds.passwordHash))) {
    renderError(401, "Current password is incorrect.");
    return;
  }
  const problem = validateNewLogin(username, body.password ?? "", body.confirm ?? "");
  if (problem) {
    renderError(400, problem);
    return;
  }

  await setAdminCredentials(username, body.password!);
  req.session.adminUsername = username;
  res.redirect("/admin/account?msg=Login updated");
});
