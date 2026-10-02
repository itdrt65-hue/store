import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { products } from "../../db/schema";

export const productsRouter = Router();

productsRouter.get("/", async (req: Request, res: Response) => {
  const allProducts = await db.select().from(products);
  res.render("admin/products/list", {
    title: "Products — Admin",
    active: "products",
    products: allProducts,
    msg: req.query.msg ?? null,
  });
});

productsRouter.get("/new", (req: Request, res: Response) => {
  res.render("admin/products/form", {
    title: "New Product — Admin",
    active: "products",
    product: null,
    error: null,
  });
});

productsRouter.post("/", async (req: Request, res: Response) => {
  const { name, description, price, stock } = req.body as Record<string, string>;

  if (!name || !price) {
    res.status(400).render("admin/products/form", {
      title: "New Product — Admin",
      active: "products",
      product: req.body,
      error: "Name and price are required.",
    });
    return;
  }

  await db.insert(products).values({
    name,
    description: description || null,
    price: Number(price),
    stock: Number(stock) || 0,
  });

  res.redirect("/admin/products?msg=Product created");
});

productsRouter.get("/:id/edit", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const [product] = await db.select().from(products).where(eq(products.id, id));

  if (!product) {
    res.redirect("/admin/products?msg=Product not found");
    return;
  }

  res.render("admin/products/form", {
    title: "Edit Product — Admin",
    active: "products",
    product,
    error: null,
  });
});

productsRouter.post("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, description, price, stock } = req.body as Record<string, string>;

  if (!name || !price) {
    res.status(400).render("admin/products/form", {
      title: "Edit Product — Admin",
      active: "products",
      product: { id, name, description, price, stock },
      error: "Name and price are required.",
    });
    return;
  }

  await db
    .update(products)
    .set({
      name,
      description: description || null,
      price: Number(price),
      stock: Number(stock) || 0,
    })
    .where(eq(products.id, id));

  res.redirect("/admin/products?msg=Product updated");
});

productsRouter.post("/:id/delete", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await db.delete(products).where(eq(products.id, id));
  res.redirect("/admin/products?msg=Product deleted");
});
