import { Router, Request, Response } from "express";
import { db } from "../../db";
import { products, orders, customers, sales } from "../../db/schema";
import { localDate } from "./sales";
import { getVendorUsage } from "../../vendor-usage";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (req: Request, res: Response) => {
  const today = localDate();
  const [allProducts, allOrders, allCustomers, allSales] = await Promise.all([
    db.select().from(products),
    db.select().from(orders),
    db.select().from(customers),
    db.select().from(sales),
  ]);
  const productNames = new Map(allProducts.map((p) => [p.id, p.name]));
  const recentSales = [...allSales]
    .sort((a, b) => (a.soldOn === b.soldOn ? b.id - a.id : a.soldOn < b.soldOn ? 1 : -1))
    .slice(0, 5)
    .map((s) => ({ ...s, productName: productNames.get(s.productId) ?? "Unknown" }));
  const todaySales = allSales.filter((s) => s.soldOn === today);

  const lowStock = allProducts.filter((p) => p.stock < 5);
  const pendingOrders = allOrders.filter((o) => o.status === "pending");
  const recentOrders = [...allOrders]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  const vendorAlerts = (await getVendorUsage()).filter((v) => v.level !== "ok");

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const date = localDate(d);
    return {
      date,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      total: allSales.filter((s) => s.soldOn === date).reduce((n, s) => n + s.total, 0),
      today: i === 6,
    };
  });

  res.render("admin/dashboard", {
    title: "Dashboard — Admin",
    active: "dashboard",
    stats: {
      productCount: allProducts.length,
      orderCount: allOrders.length,
      customerCount: allCustomers.length,
      pendingCount: pendingOrders.length,
      lowStockCount: lowStock.length,
      todayTotal: todaySales.reduce((n, s) => n + s.total, 0),
      todayCount: todaySales.length,
      dueTotal: allSales.filter((s) => s.payment === "due").reduce((n, s) => n + s.total, 0),
    },
    lowStock,
    recentSales,
    week,
    weekTotal: week.reduce((n, d) => n + d.total, 0),
    vendorAlerts,
    recentOrders,
  });
});
