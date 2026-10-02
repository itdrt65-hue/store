CREATE TABLE `admin_account` (
	`id` integer PRIMARY KEY,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
