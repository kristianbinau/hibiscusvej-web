import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	apartmentId: integer('apartment_id').notNull(),
	admin: integer('admin').notNull(),
	verifiedByUserId: integer('verified_by_user_id'),
	verifiedAt: integer('verified_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const userPersons = sqliteTable('user_persons', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	name: text('first_name').notNull(),
	phone: text('phone').notNull(),
	email: text('email').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const userLogins = sqliteTable('user_logins', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	email: text('email').notNull().unique(),
	password: text('password').notNull(),
	singleUse: integer('single_use').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const userSessions = sqliteTable('user_sessions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userLoginId: integer('user_login_id').notNull(),
	refreshToken: text('refresh_token').notNull().unique(),
	tokenFamily: text('token_family').notNull().unique(),
	expiredAt: integer('expired_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const apartments = sqliteTable(
	'apartments',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		street: text('street').notNull(),
		number: text('number').notNull(),
		floor: text('floor'),
		door: text('door'),
	},
	(apartment) => ({
		unq: unique().on(
			apartment.street,
			apartment.number,
			apartment.floor,
			apartment.door,
		),
	}),
);

export const communalBookings = sqliteTable('communal_bookings', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	from: integer('from').notNull(),
	to: integer('to').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const adminLog = sqliteTable('admin_log', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	action: text('action').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const userRelations = relations(users, ({ many, one }) => ({
	persons: many(userPersons),
	logins: many(userLogins),
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
