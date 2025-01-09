import { z } from 'zod';

const LOG_MODULE = 'Api/Admin/Users/[id]/Delete';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	currentSessionPassword: z.string(),
});

const ADMIN_ACTION = 'DeleteUser';

export default eventHandler(async (event) => {
	const params = await getValidatedRouterParams(event, routeSchema.parse);
	const body = await readValidatedBody(event, bodySchema.parse);
	const authAdmin = await useAuthValidatedAdmin(
		event,
		body.currentSessionPassword,
	);

	const now = new Date();

	const userId = params.id;

	await anonymizeUser(userId);

	try {
		await useDrizzle()
			.insert(tables.adminLogs)
			.values({
				userId: authAdmin.user.id,
				action: `${ADMIN_ACTION}: ${userId}`,
				createdAt: now,
			});
	} catch (error) {
		logError(LOG_MODULE, 'Failed AdminLog', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
