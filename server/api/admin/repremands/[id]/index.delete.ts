import { z } from 'zod';

const LOG_MODULE = 'Api/Admin/Repremands/[id]/Patch';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	currentSessionPassword: z.string(),
});

export default eventHandler(async (event) => {
	const params = await getValidatedRouterParams(event, routeSchema.parse);
	const body = await readValidatedBody(event, bodySchema.parse);
	await useAuthValidatedAdmin(event, body.currentSessionPassword);

	const id = params.id;

	try {
		await useDrizzle()
			.delete(tables.userRepremands)
			.where(eq(tables.userRepremands.id, id));
	} catch (error) {
		logError(LOG_MODULE, `Failed Delete of UserRepremandId: ${id}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
