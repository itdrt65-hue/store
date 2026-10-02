import { Router, Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { products } from "../../db/schema";

export const stockRouter = Router();

stockRouter.get("/", async (req: Request, res: Response) => {
  const all = await db.select().from(products);
  const totalUnits = all.reduce((n, p) => n + p.stock, 0);
  const totalValue = all.reduce((n, p) => n + p.stock * p.price, 0);
  res.render("admin/stock/index", {
    title: "Stock — Admin",
    active: "stock",
    products: all,
    totalUnits,
    totalValue,
    lowCount: all.filter((p) => p.stock < 5).length,
    msg: req.query.msg ?? null,
  });
});

stockRouter.post("/:id/add", async (req: Request, res: Response) => {
  const qty = Number((req.body as Record<string, string>).quantity);
  if (!Number.isInteger(qty) || qty <= 0) {
    res.redirect("/admin/stock?msg=Enter a whole number to add");
    return;
  }
  await db
    .update(products)
    .set({ stock: sql`${products.stock} + ${qty}` })
    .where(eq(products.id, Number(req.params.id)));
  res.redirect(`/admin/stock?msg=Added ${qty} to stock`);
});
