import { Router, Request, Response } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "../../db";
import { products, sales } from "../../db/schema";

export const salesRouter = Router();

const pad = (n: number) => String(n).padStart(2, "0");
export function localDate(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

salesRouter.get("/", async (req: Request, res: Response) => {
  const today = localDate();
  const month = today.slice(0, 7);

  const rows = await db
    .select({
      id: sales.id,
      quantity: sales.quantity,
      unitPrice: sales.unitPrice,
      total: sales.total,
      customerName: sales.customerName,
      payment: sales.payment,
      soldOn: sales.soldOn,
      note: sales.note,
      productName: products.name,
    })
    .from(sales)
    .leftJoin(products, eq(sales.productId, products.id))
    .orderBy(desc(sales.soldOn), desc(sales.id))
    .limit(200);

  const [sum] = await db
    .select({
      todayTotal: sql<number>`coalesce(sum(case when ${sales.soldOn} = ${today} then ${sales.total} end), 0)`,
      todayCount: sql<number>`coalesce(sum(case when ${sales.soldOn} = ${today} then 1 end), 0)`,
      monthTotal: sql<number>`coalesce(sum(case when substr(${sales.soldOn}, 1, 7) = ${month} then ${sales.total} end), 0)`,
      dueTotal: sql<number>`coalesce(sum(case when ${sales.payment} = 'due' then ${sales.total} end), 0)`,
    })
    .from(sales);

  res.render("admin/sales/list", {
    title: "Sales — Admin",
    active: "sales",
    sales: rows,
    summary: {
      todayTotal: Number(sum?.todayTotal),
      todayCount: Number(sum?.todayCount),
      monthTotal: Number(sum?.monthTotal),
      dueTotal: Number(sum?.dueTotal),
    },
    msg: req.query.msg ?? null,
  });
});

async function renderForm(res: Response, error: string | null, formData: unknown, preselect?: number) {
  const allProducts = await db.select().from(products);
  res.render("admin/sales/form", {
    title: "Record Sale — Admin",
    active: "sales",
    products: allProducts,
    today: localDate(),
    error,
    formData,
    preselect: preselect ?? null,
  });
}

salesRouter.get("/new", async (req: Request, res: Response) => {
  const pid = Number(req.query.product);
  await renderForm(res, null, null, Number.isInteger(pid) && pid > 0 ? pid : undefined);
});

salesRouter.post("/", async (req: Request, res: Response) => {
  const body = req.body as Record<string, string | undefined>;
  const productId = Number(body.productId);
  const quantity = Number(body.quantity);
  const unitPrice = Number(body.unitPrice);
  const soldOn = body.soldOn ?? "";

  const fail = async (msg: string) => {
    res.status(400);
    await renderForm(res, msg, body);
  };

  if (!productId) return fail("Choose a product.");
  if (!Number.isInteger(quantity) || quantity <= 0) return fail("Quantity must be a whole number above 0.");
  if (!Number.isFinite(unitPrice) || unitPrice < 0) return fail("Enter a valid price per cylinder.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(soldOn)) return fail("Enter a valid date.");

  const [product] = await db.select().from(products).where(eq(products.id, productId));
  if (!product) return fail("That product no longer exists.");
  if (product.stock < quantity) return fail(`Only ${product.stock} in stock for ${product.name}.`);

  await db.insert(sales).values({
    productId,
    quantity,
    unitPrice,
    total: Math.round(quantity * unitPrice * 100) / 100,
    customerName: (body.customerName ?? "").trim() || null,
    payment: body.payment === "due" ? "due" : "paid",
    soldOn,
    note: (body.note ?? "").trim() || null,
  });
  await db.update(products).set({ stock: product.stock - quantity }).where(eq(products.id, productId));

  res.redirect("/admin/sales?msg=Sale recorded");
});

salesRouter.post("/:id/paid", async (req: Request, res: Response) => {
  await db.update(sales).set({ payment: "paid" }).where(eq(sales.id, Number(req.params.id)));
  res.redirect("/admin/sales?msg=Marked as paid");
});

salesRouter.post("/:id/delete", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [sale] = await db.select().from(sales).where(eq(sales.id, id));
  if (sale) {
    // Put the cylinders back into stock
    await db
      .update(products)
      .set({ stock: sql`${products.stock} + ${sale.quantity}` })
      .where(eq(products.id, sale.productId));
    await db.delete(sales).where(eq(sales.id, id));
  }
  res.redirect("/admin/sales?msg=Sale deleted and stock restored");
});
