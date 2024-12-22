import { z } from 'zod';

const LOG_MODULE = 'Api/Users/Me/Logins/[id]/Delete';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	currentSessionPassword: z.string(),
});

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const params = await getValidatedRouterParams(event, routeSchema.parse);
	const body = await readValidatedBody(event, bodySchema.parse);

	const id = params.id;

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

	const currentLoginId = currentSession.userLoginId;

	// If User tries to delete currentLogin, return 400 Bad Request - Cannot delete current login
	if (id === currentLoginId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Cannot delete current login',
		});
	}

	// If User only has 1 login, return 400 Bad Request - Cannot delete last login
	const count = await useDrizzle().$count(
		tables.userLogins,
		eq(tables.userLogins.userId, authUser.user.id),
	);

	if (count <= 1) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Cannot delete last login',
		});
	}

	try {
		await useDrizzle()
			.delete(tables.userLogins)
			.where(
				and(
					eq(tables.userLogins.userId, authUser.user.id),
					eq(tables.userLogins.id, id),
				),
			);
	} catch (error) {
		logError(LOG_MODULE, `Failed Delete of UserLoginId: ${id}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
