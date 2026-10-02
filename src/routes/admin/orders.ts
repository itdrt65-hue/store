import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { orders, customers, products } from "../../db/schema";

export const ordersRouter = Router();

const STATUSES = ["pending", "confirmed", "delivered", "cancelled"] as const;

ordersRouter.get("/", async (req: Request, res: Response) => {
  const rows = await db
    .select({
      id: orders.id,
      quantity: orders.quantity,
      status: orders.status,
      createdAt: orders.createdAt,
      customerName: customers.name,
      customerPhone: customers.phone,
      productName: products.name,
      productPrice: products.price,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(products, eq(orders.productId, products.id));

  res.render("admin/orders/list", {
    title: "Orders — Admin",
    active: "orders",
    orders: rows,
    statuses: STATUSES,
    msg: req.query.msg ?? null,
  });
});

ordersRouter.get("/new", async (req: Request, res: Response) => {
  const [allCustomers, allProducts] = await Promise.all([
    db.select().from(customers),
    db.select().from(products),
  ]);

  res.render("admin/orders/form", {
    title: "New Order — Admin",
    active: "orders",
    customers: allCustomers,
    products: allProducts,
    statuses: STATUSES,
    error: null,
    formData: null,
  });
});

ordersRouter.post("/", async (req: Request, res: Response) => {
  const { customerId, productId, quantity, status } = req.body as Record<string, string>;

  if (!customerId || !productId || !quantity) {
    const [allCustomers, allProducts] = await Promise.all([
      db.select().from(customers),
      db.select().from(products),
    ]);
    res.status(400).render("admin/orders/form", {
      title: "New Order — Admin",
      active: "orders",
      customers: allCustomers,
      products: allProducts,
      statuses: STATUSES,
      error: "Customer, product, and quantity are required.",
      formData: req.body,
    });
    return;
  }

  await db.insert(orders).values({
    customerId: Number(customerId),
    productId: Number(productId),
    quantity: Number(quantity),
    status: (status as (typeof STATUSES)[number]) || "pending",
  });

  res.redirect("/admin/orders?msg=Order created");
});

ordersRouter.post("/:id/status", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body as Record<string, string>;

  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    res.redirect("/admin/orders?msg=Invalid status");
    return;
  }

  await db
    .update(orders)
    .set({ status: status as (typeof STATUSES)[number] })
    .where(eq(orders.id, id));

  res.redirect("/admin/orders?msg=Order updated");
});

ordersRouter.post("/:id/delete", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await db.delete(orders).where(eq(orders.id, id));
  res.redirect("/admin/orders?msg=Order deleted");
});
