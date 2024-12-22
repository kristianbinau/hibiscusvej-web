import { z } from 'zod';

const LOG_MODULE = 'Api/Users/Me/Logins/[id]/Post';

const bodySchema = z.object({
	email: z.string().email(),
	password: z.string(),
	currentSessionPassword: z.string(),
});

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const body = await readValidatedBody(event, bodySchema.parse);

	// If Email is already in use, return 409 Conflict
	const userByEmail = await useDrizzle()
		.select()
		.from(tables.userLogins)
		.where(eq(tables.userLogins.email, body.email))
		.get();
	if (userByEmail) {
		throw createError({
			statusCode: 409,
			statusMessage: 'Conflict',
		});
	}

	const currentSession = await useDrizzle()
		.select()
		.from(tables.userSessions)
		.where(and(eq(tables.userSessions.tokenFamily, authUser.session.family)))
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
		const hashedPassword = await hashPassword(body.password);
		const now = new Date();

		await useDrizzle().insert(tables.userLogins).values({
			userId: authUser.user.id,
			email: body.email,
			password: hashedPassword,
			singleUse: false,
			createdAt: now,
			updatedAt: now,
		});
	} catch (error) {
		logError(LOG_MODULE, 'Failed Insert', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
