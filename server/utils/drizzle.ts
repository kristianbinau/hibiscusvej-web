export {
	sql,
	count,
	eq,
	and,
	or,
	gte,
	lte,
	desc,
	asc,
	isNull,
	inArray,
} from 'drizzle-orm';

import * as schema from '../db/schema';

export const tables = schema;

export function useDrizzle() {
	return db;
}

export type User = typeof schema.users.$inferSelect;
export type UserSession = typeof schema.userSessions.$inferSelect;
