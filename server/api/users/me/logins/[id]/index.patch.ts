import { z } from 'zod';

const LOG_MODULE = 'Api/Users/Me/Logins/[id]/Patch';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	email: z.string().email().optional(),
	password: z.string().optional(),
	currentSessionPassword: z.string(),
});

export default eventHandler(async (event) => {
	const params = await getValidatedRouterParams(event, routeSchema.parse);
	const body = await readValidatedBody(event, bodySchema.parse);
	const authUser = await useAuthValidatedUser(
		event,
		body.currentSessionPassword,
	);

	const id = params.id;

	const userLogin = await useDrizzle()
		.select()
		.from(tables.userLogins)
		.where(
			and(
				eq(tables.userLogins.userId, authUser.user.id),
				eq(tables.userLogins.id, id),
			),
		)
		.get();

	if (!userLogin) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
		});
	}

	try {
		const newPassword =
			body.password !== undefined
				? await hashPassword(body.password)
				: undefined;
		const now = new Date();

		await useDrizzle()
			.update(tables.userLogins)
			.set({
				email: body.email,
				password: newPassword,
				updatedAt: now,
			})
			.where(
				and(
					eq(tables.userLogins.userId, authUser.user.id),
					eq(tables.userLogins.id, id),
				),
			);
	} catch (error) {
		logError(LOG_MODULE, `Failed Update of UserLoginId: ${id}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
