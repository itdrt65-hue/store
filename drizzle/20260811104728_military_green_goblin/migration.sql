CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`phone` text NOT NULL UNIQUE,
	`address` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`customer_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	CONSTRAINT `fk_orders_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`),
	CONSTRAINT `fk_orders_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`description` text,
	`price` real NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
