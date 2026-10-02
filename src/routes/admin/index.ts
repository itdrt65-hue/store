import { Router } from "express";
import { requireAdmin } from "../../middleware/auth";
import { authRouter } from "./auth";
import { dashboardRouter } from "./dashboard";
import { productsRouter } from "./products";
import { ordersRouter } from "./orders";
import { customersRouter } from "./customers";
import { vendorsRouter } from "./vendors";
import { salesRouter } from "./sales";
import { stockRouter } from "./stock";

export const adminRouter = Router();

// Login/logout routes are public
adminRouter.use("/", authRouter);

// Everything else requires an admin session
adminRouter.use(requireAdmin);
adminRouter.use("/", dashboardRouter);
adminRouter.use("/products", productsRouter);
adminRouter.use("/orders", ordersRouter);
adminRouter.use("/customers", customersRouter);
adminRouter.use("/vendors", vendorsRouter);
adminRouter.use("/sales", salesRouter);
adminRouter.use("/stock", stockRouter);
adminRouter.get("/more", (req, res) => {
  res.render("admin/more", { title: "More — Admin", active: "more" });
});
