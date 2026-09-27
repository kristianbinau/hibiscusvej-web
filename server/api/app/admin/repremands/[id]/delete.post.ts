import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Admin/Repremands/[id]/Delete';

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
	const authAdmin = await useAuthValidatedAdmin(
		event,
		body.currentSessionPassword,
	);

	const id = params.id;

	const userRepremand = await useDrizzle()
		.select()
		.from(tables.userRepremands)
		.where(eq(tables.userRepremands.id, id))
		.get();

	if (!userRepremand) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
		});
	}

	await assertCanActOnTarget(authAdmin, userRepremand.userId);

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
