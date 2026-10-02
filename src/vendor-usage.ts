import { and, gte, lt, sql } from "drizzle-orm";
import { db } from "./db";
import { vendors, vendorPurchases } from "./db/schema";

export type VendorUsage = {
  id: number;
  name: string;
  panNumber: string;
  yearlyLimit: number;
  purchased: number;
  cylinders: number;
  remaining: number;
  percent: number;
  level: "ok" | "warn" | "over";
};

export const WARN_AT = 80;

export function currentYear() {
  return new Date().getFullYear();
}

export async function getVendorUsage(year = currentYear()): Promise<VendorUsage[]> {
  const rows = await db
    .select({
      vendorId: vendorPurchases.vendorId,
      total: sql<number>`coalesce(sum(${vendorPurchases.amount}), 0)`,
      cyl: sql<number>`coalesce(sum(${vendorPurchases.cylinders}), 0)`,
    })
    .from(vendorPurchases)
    .where(
      and(
        gte(vendorPurchases.purchasedOn, `${year}-01-01`),
        lt(vendorPurchases.purchasedOn, `${year + 1}-01-01`),
      ),
    )
    .groupBy(vendorPurchases.vendorId);
  const totals = new Map(rows.map((r) => [r.vendorId, Number(r.total)]));
  const cyls = new Map(rows.map((r) => [r.vendorId, Number(r.cyl)]));

  const all = await db.select().from(vendors);
  return all.map((v) => {
    const purchased = totals.get(v.id) ?? 0;
    const percent = v.yearlyLimit > 0 ? Math.round((purchased / v.yearlyLimit) * 100) : 0;
    return {
      id: v.id,
      name: v.name,
      panNumber: v.panNumber,
      yearlyLimit: v.yearlyLimit,
      purchased,
      cylinders: cyls.get(v.id) ?? 0,
      remaining: v.yearlyLimit - purchased,
      percent,
      level: purchased > v.yearlyLimit ? "over" : percent >= WARN_AT ? "warn" : "ok",
    };
  });
}
