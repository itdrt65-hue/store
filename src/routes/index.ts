import { Router, Request, Response } from "express";
import { db } from "../db";
import { products } from "../db/schema";

export const indexRouter = Router();

indexRouter.get("/", async (req: Request, res: Response) => {
  const allProducts = await db.select().from(products);

  res.render("index", {
    title: "Agrahari Gas",
    products: allProducts,
  });
});
