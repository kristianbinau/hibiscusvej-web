import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Admin/Repremands/[id]/Patch';

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
	await useAuthValidatedAdmin(event, body.currentSessionPassword);

	const id = params.id;

	try {
		await useDrizzle()
			.delete(tables.userRepremands)
			.where(eq(tables.userRepremands.id, id));
	} catch (error) {
		void logError(LOG_MODULE, `Failed Delete of UserRepremandId: ${id}`, error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
