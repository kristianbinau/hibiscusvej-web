import {
	sqliteTable,
	text,
	integer,
	unique,
	index,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable(
	'users',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		apartmentId: integer('apartment_id').notNull(),
		admin: integer('admin', { mode: 'boolean' }).notNull(),
		verifiedByUserId: integer('verified_by_user_id'),
		verifiedAt: integer('verified_at', { mode: 'timestamp' }),
		deletedAt: integer('deleted_at', { mode: 'timestamp' }),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	},
	(_user) => [],
);

export const userPersons = sqliteTable(
	'user_persons',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: integer('user_id').notNull(),
		name: text('first_name').notNull(),
		phone: text('phone').notNull(),
		email: text('email').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	},
	(person) => [index('user_persons_user_idx').on(person.userId)],
);

export const userLogins = sqliteTable(
	'user_logins',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: integer('user_id').notNull(),
		email: text('email').notNull().unique(),
		password: text('password').notNull(),
		singleUse: integer('single_use', { mode: 'boolean' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	},
	(login) => [
		index('user_logins_user_idx').on(login.userId),
		unique('user_logins_email_uidx').on(login.email),
	],
);

export const userSessions = sqliteTable(
	'user_sessions',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userLoginId: integer('user_login_id').notNull(),
		refreshToken: text('refresh_token').notNull().unique(),
		tokenFamily: text('token_family').notNull().unique(),
		expiredAt: integer('expired_at', { mode: 'timestamp' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	},
	(session) => [
		index('user_sessions_user_login_idx').on(session.userLoginId),
		unique('user_sessions_refresh_token_uidx').on(session.refreshToken),
		index('user_sessions_token_family_idx').on(session.tokenFamily),
	],
);

export const userSubscriptions = sqliteTable(
	'user_subscriptions',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: integer('user_id').notNull(),
		subscriptionObject: text('subscription_object', { mode: 'json' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	},
	(subscription) => [
		index('user_subscriptions_user_idx').on(subscription.userId),
	],
);

export const userSettings = sqliteTable(
	'user_settings',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: integer('user_id').notNull(),
		key: text('key').notNull(),
		value: text('value').notNull(),
	},
	(setting) => [
		index('user_settings_user_idx').on(setting.userId),
		unique('user_settings_key_user_uidx').on(setting.key, setting.userId),
	],
);

export const userRepremands = sqliteTable(
	'user_repremands',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: integer('user_id').notNull(),
		type: text('type', { enum: ['ban', 'warning'] }).notNull(),
		reason: text('reason').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp' }),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	},
	(repremand) => [
		index('user_repremands_user_idx').on(repremand.userId),
		index('user_repremands_type_idx').on(repremand.type),
	],
);

export const apartments = sqliteTable(
	'apartments',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		street: text('street').notNull(),
		number: text('number').notNull(),
		floor: text('floor'),
		door: text('door'),
	},
	(apartment) => [
		unique('apartments_address_uidx').on(
			apartment.street,
			apartment.number,
			apartment.floor,
			apartment.door,
		),
	],
);

export const communalBookings = sqliteTable(
	'communal_bookings',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: integer('user_id').notNull(),
		from: integer('from', { mode: 'timestamp' }).notNull(),
		to: integer('to', { mode: 'timestamp' }).notNull(),
		deletedAt: integer('deleted_at', { mode: 'timestamp' }),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	},
	(booking) => [
		index('communal_bookings_user_idx').on(booking.userId),
		index('communal_bookings_from_idx').on(booking.from),
		index('communal_bookings_to_idx').on(booking.to),
	],
);

export const adminLogs = sqliteTable(
	'admin_logs',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: integer('user_id').notNull(),
		action: text('action').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	},
	(log) => [index('admin_logs_user_idx').on(log.userId)],
);

export const userRelations = relations(users, ({ many, one }) => ({
	persons: many(userPersons),
	logins: many(userLogins),
	subscriptions: many(userSubscriptions),
	settings: many(userSettings),
	apartment: one(apartments, {
		fields: [users.apartmentId],
		references: [apartments.id],
	}),
	verifiedBy: one(users, {
		fields: [users.verifiedByUserId],
		references: [users.id],
	}),
}));

export const userPersonsRelations = relations(userPersons, ({ one }) => ({
	user: one(users, {
		fields: [userPersons.userId],
		references: [users.id],
	}),
}));

export const userLoginsRelations = relations(userLogins, ({ many, one }) => ({
	sessions: many(userSessions),
	user: one(users, {
		fields: [userLogins.userId],
		references: [users.id],
	}),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
	login: one(userLogins, {
		fields: [userSessions.userLoginId],
		references: [userLogins.id],
	}),
}));

export const apartmentRelations = relations(apartments, ({ many }) => ({
	users: many(users),
}));
