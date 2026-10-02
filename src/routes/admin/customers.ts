import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { customers } from "../../db/schema";

export const customersRouter = Router();

customersRouter.get("/", async (req: Request, res: Response) => {
  const allCustomers = await db.select().from(customers);
  res.render("admin/customers/list", {
    title: "Customers — Admin",
    active: "customers",
    customers: allCustomers,
    msg: req.query.msg ?? null,
  });
});

customersRouter.get("/new", (req: Request, res: Response) => {
  res.render("admin/customers/form", {
    title: "New Customer — Admin",
    active: "customers",
    customer: null,
    error: null,
  });
});

customersRouter.post("/", async (req: Request, res: Response) => {
  const { name, phone, address } = req.body as Record<string, string>;

  if (!name || !phone || !address) {
    res.status(400).render("admin/customers/form", {
      title: "New Customer — Admin",
      active: "customers",
      customer: req.body,
      error: "Name, phone, and address are all required.",
    });
    return;
  }

  try {
    await db.insert(customers).values({ name, phone, address });
  } catch {
    res.status(400).render("admin/customers/form", {
      title: "New Customer — Admin",
      active: "customers",
      customer: req.body,
      error: "A customer with this phone number already exists.",
    });
    return;
  }

  res.redirect("/admin/customers?msg=Customer added");
});

customersRouter.get("/:id/edit", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [customer] = await db.select().from(customers).where(eq(customers.id, id));

  if (!customer) {
    res.redirect("/admin/customers?msg=Customer not found");
    return;
  }

  res.render("admin/customers/form", {
    title: "Edit Customer — Admin",
    active: "customers",
    customer,
    error: null,
  });
});

customersRouter.post("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, phone, address } = req.body as Record<string, string>;

  if (!name || !phone || !address) {
    res.status(400).render("admin/customers/form", {
      title: "Edit Customer — Admin",
      active: "customers",
      customer: { id, name, phone, address },
      error: "Name, phone, and address are all required.",
    });
    return;
  }

  try {
    await db.update(customers).set({ name, phone, address }).where(eq(customers.id, id));
  } catch {
    res.status(400).render("admin/customers/form", {
      title: "Edit Customer — Admin",
      active: "customers",
      customer: { id, name, phone, address },
      error: "A customer with this phone number already exists.",
    });
    return;
  }

  res.redirect("/admin/customers?msg=Customer updated");
});

customersRouter.post("/:id/delete", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await db.delete(customers).where(eq(customers.id, id));
  res.redirect("/admin/customers?msg=Customer deleted");
});
