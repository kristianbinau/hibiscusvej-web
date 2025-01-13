import { z } from 'zod';

const routeSchema = z.object({
	id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
	await useAuthAdmin(event);
	const params = await getValidatedRouterParams(event, routeSchema.parse);

	const userId = params.id;

	const userRepremands = await useDrizzle()
		.select()
		.from(tables.userRepremands)
		.where(eq(tables.userRepremands.userId, userId))
		.all();

	return {
		repremands: userRepremands,
	};
});
