ALTER TABLE `communal_bookings` RENAME COLUMN "from" TO "from_timestamp";--> statement-breakpoint
ALTER TABLE `communal_bookings` RENAME COLUMN "to" TO "to_timestamp";--> statement-breakpoint
DROP INDEX `communal_bookings_from_idx`;--> statement-breakpoint
DROP INDEX `communal_bookings_to_idx`;--> statement-breakpoint
CREATE INDEX `communal_bookings_from_timestamp_idx` ON `communal_bookings` (`from_timestamp`);--> statement-breakpoint
CREATE INDEX `communal_bookings_to_timestamp_idx` ON `communal_bookings` (`to_timestamp`);