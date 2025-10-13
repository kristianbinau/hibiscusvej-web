CREATE TABLE `communal_booking_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`from_timestamp` integer NOT NULL,
	`to_timestamp` integer NOT NULL,
	`request_needed_reasons` text,
	`request_text` text,
	`permitted` integer,
	`handled_text` text,
	`handled_by_user_id` integer,
	`handled_at` integer,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `communal_booking_requests_user_idx` ON `communal_booking_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `communal_booking_requests_from_timestamp_idx` ON `communal_booking_requests` (`from_timestamp`);--> statement-breakpoint
CREATE INDEX `communal_booking_requests_to_timestamp_idx` ON `communal_booking_requests` (`to_timestamp`);--> statement-breakpoint
ALTER TABLE `communal_bookings` ADD `communal_booking_request_id` integer;--> statement-breakpoint
CREATE INDEX `communal_bookings_request_id_idx` ON `communal_bookings` (`communal_booking_request_id`);