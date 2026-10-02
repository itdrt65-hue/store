import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  address: text("address").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  status: text("status", {
    enum: ["pending", "confirmed", "delivered", "cancelled"],
  })
    .notNull()
    .default("pending"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const sales = sqliteTable("sales", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  total: real("total").notNull(),
  customerName: text("customer_name"),
  payment: text("payment", { enum: ["paid", "due"] })
    .notNull()
    .default("paid"),
  soldOn: text("sold_on").notNull(),
  note: text("note"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const vendors = sqliteTable("vendors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  panNumber: text("pan_number").notNull().unique(),
  yearlyLimit: real("yearly_limit").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const vendorPurchases = sqliteTable("vendor_purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  cylinders: integer("cylinders"),
  purchasedOn: text("purchased_on").notNull(),
  note: text("note"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type VendorPurchase = typeof vendorPurchases.$inferSelect;
