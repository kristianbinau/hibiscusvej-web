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
				adminName: tables.userPersons.name,
			})
			.from(tables.adminLogs)
			.leftJoin(
				tables.userPersons,
				eq(tables.adminLogs.userId, tables.userPersons.userId),
			)
			.orderBy(desc(tables.adminLogs.id), asc(tables.userPersons.id))
			.limit(100)
			.all();

		const seen = new Set<number>();
		const userNames = new Map<number, string | null>();
		const dedupedLogs = [];
		for (const log of logs) {
			if (seen.has(log.id)) continue;
			seen.add(log.id);
			if (log.adminName && !userNames.has(log.userId)) {
				userNames.set(log.userId, log.adminName);
			}
			dedupedLogs.push({
				id: log.id,
				userId: log.userId,
				action: log.action,
				createdAt: log.createdAt,
				adminName: userNames.get(log.userId) ?? null,
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
