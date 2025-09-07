const LOG_MODULE = 'Utils/Anonymize';

export const anonymizeUser = async (userId: number) => {
	const now = new Date();

	try {
		await useDrizzle()
			.update(tables.users)
			.set({
				deletedAt: now,
				updatedAt: now,
			})
			.where(eq(tables.users.id, userId));

		await useDrizzle()
			.update(tables.userPersons)
			.set({
				name: 'Deleted User',
				email: '',
				phone: '',
				updatedAt: now,
			})
			.where(eq(tables.userPersons.userId, userId));

		const logins = await useDrizzle()
			.delete(tables.userLogins)
			.where(eq(tables.userLogins.userId, userId))
			.returning()
			.all();

		const loginIds = logins.map((login) => login.id);

		await useDrizzle()
			.delete(tables.userSessions)
			.where(inArray(tables.userSessions.userLoginId, loginIds));

		await useDrizzle()
			.delete(tables.userSubscriptions)
			.where(eq(tables.userSubscriptions.userId, userId));

		await useDrizzle()
			.delete(tables.userSettings)
			.where(eq(tables.userSettings.userId, userId));

		await useDrizzle()
			.update(tables.communalBookings)
			.set({
				deletedAt: now,
			})
			.where(
				and(
					eq(tables.communalBookings.userId, userId),
					gte(tables.communalBookings.fromTimestamp, now),
				),
			);
	} catch (error) {
		void logError(LOG_MODULE, `Failed Delete of UserId: ${userId}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
};
