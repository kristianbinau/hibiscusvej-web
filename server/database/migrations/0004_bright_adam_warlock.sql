CREATE TABLE `user_repremands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`type` text NOT NULL,
	`reason` text NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `user_repremands_user_idx` ON `user_repremands` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_repremands_type_idx` ON `user_repremands` (`type`);