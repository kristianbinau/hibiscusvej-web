CREATE TABLE `admin_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`action` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `apartments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`street` text NOT NULL,
	`number` text NOT NULL,
	`floor` text,
	`door` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apartments_street_number_floor_door_unique` ON `apartments` (`street`,`number`,`floor`,`door`);--> statement-breakpoint
CREATE TABLE `communal_bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`from` integer NOT NULL,
	`to` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_logins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`single_use` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_logins_email_unique` ON `user_logins` (`email`);--> statement-breakpoint
CREATE TABLE `user_persons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`first_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_login_id` integer NOT NULL,
	`refresh_token` text NOT NULL,
	`token_family` text NOT NULL,
	`expired_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_refresh_token_unique` ON `user_sessions` (`refresh_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_token_family_unique` ON `user_sessions` (`token_family`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`apartment_id` integer NOT NULL,
	`admin` integer NOT NULL,
	`verified_by_user_id` integer,
	`verified_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
