CREATE TABLE `user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `user_settings_user_idx` ON `user_settings` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_settings_key_user_uidx` ON `user_settings` (`key`,`user_id`);--> statement-breakpoint
CREATE TABLE `user_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`subscription_object` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `user_subscriptions_user_idx` ON `user_subscriptions` (`user_id`);--> statement-breakpoint
DROP INDEX `apartments_street_number_floor_door_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `apartments_address_uidx` ON `apartments` (`street`,`number`,`floor`,`door`);--> statement-breakpoint
CREATE INDEX `admin_logs_user_idx` ON `admin_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `communal_bookings_user_idx` ON `communal_bookings` (`user_id`);--> statement-breakpoint
CREATE INDEX `communal_bookings_from_idx` ON `communal_bookings` (`from`);--> statement-breakpoint
CREATE INDEX `communal_bookings_to_idx` ON `communal_bookings` (`to`);--> statement-breakpoint
CREATE INDEX `user_logins_user_idx` ON `user_logins` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_logins_email_uidx` ON `user_logins` (`email`);--> statement-breakpoint
CREATE INDEX `user_persons_user_idx` ON `user_persons` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_sessions_user_login_idx` ON `user_sessions` (`user_login_id`);--> statement-breakpoint
CREATE INDEX `user_sessions_token_family_idx` ON `user_sessions` (`token_family`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_refresh_token_uidx` ON `user_sessions` (`refresh_token`);