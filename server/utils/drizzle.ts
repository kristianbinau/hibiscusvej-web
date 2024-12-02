import { drizzle } from 'drizzle-orm/d1';
export { sql, eq, and, or, gte, lte } from 'drizzle-orm';

import * as schema from '../database/schema';

export const tables = schema;

export function useDrizzle() {
	return drizzle(hubDatabase(), { schema });
}

export type User = typeof schema.users.$inferSelect;
export type UserSession = typeof schema.userSessions.$inferSelect;
