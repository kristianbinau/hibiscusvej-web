const LOG_MODULE = 'Api/SystemAdmin/Logs';

export default defineEventHandler(async (event) => {
	await useAuthSystemAdmin(event);

	try {
		const logs = await useDrizzle()
			.select({
				id: tables.adminLogs.id,
				userId: tables.adminLogs.userId,
				action: tables.adminLogs.action,
				createdAt: tables.adminLogs.createdAt,
				email: tables.userLogins.email,
			})
			.from(tables.adminLogs)
			.leftJoin(
				tables.userLogins,
				eq(tables.adminLogs.userId, tables.userLogins.userId),
			)
			.orderBy(desc(tables.adminLogs.id))
			.limit(100)
			.all();

		const seen = new Set<number>();
		const userLogins = new Map<number, string | null>();
		const dedupedLogs = [];
		for (const log of logs) {
			if (seen.has(log.id)) continue;
			seen.add(log.id);
			if (log.email && !userLogins.has(log.userId)) {
				userLogins.set(log.userId, log.email);
			}
			dedupedLogs.push({
				id: log.id,
				userId: log.userId,
				action: log.action,
				createdAt: log.createdAt,
				email: userLogins.get(log.userId) ?? null,
			});
		}

		return {
			logs: dedupedLogs,
		};
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Fetch', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
