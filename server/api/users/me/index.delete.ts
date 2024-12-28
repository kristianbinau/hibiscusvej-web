import { z } from 'zod';

const LOG_MODULE = 'Api/Users/Me/Delete';

const bodySchema = z.object({
	currentSessionPassword: z.string(),
});

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const body = await readValidatedBody(event, bodySchema.parse);

	const now = new Date();

	const userId = authUser.user.id;

	const currentSession = await useDrizzle()
		.select()
		.from(tables.userSessions)
		.where(eq(tables.userSessions.tokenFamily, authUser.session.family))
		.get();

	if (!currentSession) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	const currentLogin = await useDrizzle()
		.select()
		.from(tables.userLogins)
		.where(eq(tables.userLogins.id, currentSession.userLoginId))
		.get();

	if (!currentLogin) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If currentSessionPassword does not match, return 401 Unauthorized
	const passwordMatch = await comparePassword(
		body.currentSessionPassword,
		currentLogin.password,
	);
	if (!passwordMatch) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

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
					eq(tables.communalBookings.userId, authUser.user.id),
					gte(tables.communalBookings.from, now),
				),
			);
	} catch (error) {
		logError(LOG_MODULE, `Failed Delete of UserId: ${userId}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
