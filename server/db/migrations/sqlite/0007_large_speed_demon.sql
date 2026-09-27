PRAGMA defer_foreign_keys=on;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`apartment_id` integer,
	`admin` integer NOT NULL,
	`system_admin` integer DEFAULT false NOT NULL,
	`verified_by_user_id` integer,
	`verified_at` integer,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "apartment_id", "admin", "verified_by_user_id", "verified_at", "deleted_at", "created_at", "updated_at") SELECT "id", "apartment_id", "admin", "verified_by_user_id", "verified_at", "deleted_at", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA defer_foreign_keys=off;