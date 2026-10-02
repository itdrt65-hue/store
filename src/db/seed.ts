import { db } from "./index";
import { products } from "./schema";

async function seed() {
  const existing = await db.select().from(products);
  if (existing.length > 0) {
    console.log("Products already seeded, skipping.");
    return;
  }

  await db.insert(products).values([
    {
      name: "14.2kg LPG Cylinder",
      description: "Standard domestic LPG cylinder refill",
      price: 850,
      stock: 40,
    },
    {
      name: "19kg Commercial Cylinder",
      description: "Commercial-grade LPG cylinder refill",
      price: 1650,
      stock: 15,
    },
    {
      name: "5kg Mini Cylinder",
      description: "Portable LPG cylinder for small households",
      price: 450,
      stock: 25,
    },
  ]);

  console.log("Seeded products.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
