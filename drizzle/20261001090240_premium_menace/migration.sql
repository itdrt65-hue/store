CREATE TABLE `vendor_purchases` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`vendor_id` integer NOT NULL,
	`amount` real NOT NULL,
	`cylinders` integer,
	`purchased_on` text NOT NULL,
	`note` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	CONSTRAINT `fk_vendor_purchases_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`pan_number` text NOT NULL UNIQUE,
	`yearly_limit` real NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
