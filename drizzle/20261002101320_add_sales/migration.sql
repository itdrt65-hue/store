CREATE TABLE IF NOT EXISTS `sales` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`total` real NOT NULL,
	`customer_name` text,
	`payment` text DEFAULT 'paid' NOT NULL,
	`sold_on` text NOT NULL,
	`note` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	CONSTRAINT `fk_sales_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
);
