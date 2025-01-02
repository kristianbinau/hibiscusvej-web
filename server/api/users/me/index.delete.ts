import { z } from 'zod';

const schema = z.object({
	currentSessionPassword: z.string(),
});

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const body = await readValidatedBody(event, schema.parse);

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

	await anonymizeUser(userId);

	return true;
});
