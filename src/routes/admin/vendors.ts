import { Router, Request, Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../../db";
import { vendors, vendorPurchases } from "../../db/schema";
import { getVendorUsage, currentYear } from "../../vendor-usage";

export const vendorsRouter = Router();

const today = () => new Date().toISOString().slice(0, 10);

function parseVendor(body: Record<string, string>) {
  const name = (body.name ?? "").trim();
  const panNumber = (body.panNumber ?? "").trim();
  const yearlyLimit = Number(body.yearlyLimit);
  let error: string | null = null;
  if (!name || !panNumber || !body.yearlyLimit) error = "Vendor name, PAN number and yearly limit are required.";
  else if (!Number.isFinite(yearlyLimit) || yearlyLimit <= 0) error = "Yearly limit must be an amount above 0.";
  return { name, panNumber, yearlyLimit, error };
}

vendorsRouter.get("/", async (req: Request, res: Response) => {
  res.render("admin/vendors/list", {
    title: "Vendors — Admin",
    active: "vendors",
    year: currentYear(),
    usage: await getVendorUsage(),
    msg: req.query.msg ?? null,
  });
});

vendorsRouter.get("/new", (req: Request, res: Response) => {
  res.render("admin/vendors/form", { title: "New Vendor — Admin", active: "vendors", vendor: null, error: null });
});

vendorsRouter.post("/", async (req: Request, res: Response) => {
  const v = parseVendor(req.body);
  if (v.error) {
    res.status(400).render("admin/vendors/form", { title: "New Vendor — Admin", active: "vendors", vendor: req.body, error: v.error });
    return;
  }
  try {
    await db.insert(vendors).values({ name: v.name, panNumber: v.panNumber, yearlyLimit: v.yearlyLimit });
  } catch {
    res.status(400).render("admin/vendors/form", { title: "New Vendor — Admin", active: "vendors", vendor: req.body, error: "A vendor with this PAN number already exists." });
    return;
  }
  res.redirect("/admin/vendors?msg=Vendor added");
});

vendorsRouter.get("/:id/edit", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
  if (!vendor) {
    res.redirect("/admin/vendors?msg=Vendor not found");
    return;
  }
  res.render("admin/vendors/form", { title: "Edit Vendor — Admin", active: "vendors", vendor, error: null });
});

vendorsRouter.post("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const v = parseVendor(req.body);
  if (v.error) {
    res.status(400).render("admin/vendors/form", { title: "Edit Vendor — Admin", active: "vendors", vendor: { ...req.body, id }, error: v.error });
    return;
  }
  try {
    await db.update(vendors).set({ name: v.name, panNumber: v.panNumber, yearlyLimit: v.yearlyLimit }).where(eq(vendors.id, id));
  } catch {
    res.status(400).render("admin/vendors/form", { title: "Edit Vendor — Admin", active: "vendors", vendor: { ...req.body, id }, error: "A vendor with this PAN number already exists." });
    return;
  }
  res.redirect("/admin/vendors?msg=Vendor updated");
});

vendorsRouter.post("/:id/delete", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await db.delete(vendorPurchases).where(eq(vendorPurchases.vendorId, id));
  await db.delete(vendors).where(eq(vendors.id, id));
  res.redirect("/admin/vendors?msg=Vendor deleted");
});

// Purchases
async function renderPurchases(res: Response, id: number, extra: { error?: string | null; msg?: unknown; formData?: unknown }) {
  const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
  if (!vendor) {
    res.redirect("/admin/vendors?msg=Vendor not found");
    return;
  }
  const usage = (await getVendorUsage()).find((u) => u.id === id)!;
  const purchases = await db
    .select()
    .from(vendorPurchases)
    .where(eq(vendorPurchases.vendorId, id))
    .orderBy(desc(vendorPurchases.purchasedOn), desc(vendorPurchases.id));
  res.render("admin/vendors/purchases", {
    title: `${vendor.name} — Purchases`,
    active: "vendors",
    year: currentYear(),
    vendor,
    usage,
    purchases,
    today: today(),
    error: extra.error ?? null,
    msg: extra.msg ?? null,
    formData: extra.formData ?? null,
  });
}

vendorsRouter.get("/:id/purchases", (req: Request, res: Response) =>
  renderPurchases(res, Number(req.params.id), { msg: req.query.msg }),
);

vendorsRouter.post("/:id/purchases", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { amount, cylinders, note } = req.body as Record<string, string>;
  const purchasedOn = (req.body.purchasedOn as string | undefined) ?? "";
  const amt = Number(amount);
  const cyl = cylinders ? Number(cylinders) : null;
  if (!Number.isFinite(amt) || amt <= 0 || (cyl !== null && (!Number.isInteger(cyl) || cyl < 0)) || !/^\d{4}-\d{2}-\d{2}$/.test(purchasedOn)) {
    res.status(400);
    await renderPurchases(res, id, { error: "Enter a purchase amount above 0, a whole number of cylinders (or leave it empty) and a valid date.", formData: req.body });
    return;
  }
  await db.insert(vendorPurchases).values({ vendorId: id, amount: amt, cylinders: cyl, purchasedOn, note: (note ?? "").trim() || null });
  res.redirect(`/admin/vendors/${id}/purchases?msg=Purchase recorded`);
});

vendorsRouter.post("/:id/purchases/:pid/delete", async (req: Request, res: Response) => {
  await db.delete(vendorPurchases).where(eq(vendorPurchases.id, Number(req.params.pid)));
  res.redirect(`/admin/vendors/${Number(req.params.id)}/purchases?msg=Purchase deleted`);
});
