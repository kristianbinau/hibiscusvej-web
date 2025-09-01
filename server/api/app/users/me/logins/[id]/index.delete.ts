import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Users/Me/Logins/[id]/Delete';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	currentSessionPassword: z.string(),
});

export default defineEventHandler(async (event) => {
	const params = await getValidatedRouterParams(event, (data) =>
		routeSchema.parse(data),
	);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));
	const authUser = await useAuthValidatedUser(
		event,
		body.currentSessionPassword,
	);

	const id = params.id;
	const currentLoginId = authUser.login.id;

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
		void logError(LOG_MODULE, `Failed Delete of UserLoginId: ${id}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
