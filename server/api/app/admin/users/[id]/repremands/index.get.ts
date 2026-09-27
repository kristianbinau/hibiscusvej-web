import { z } from 'zod/v4';

const routeSchema = z.object({
	id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
	const authAdmin = await useAuthAdmin(event);
	const params = await getValidatedRouterParams(event, (data) =>
		routeSchema.parse(data),
	);

	const userId = params.id;

	await assertCanActOnTarget(authAdmin, userId);

	const repremands = await useDrizzle()
		.select()
		.from(tables.userRepremands)
		.where(eq(tables.userRepremands.userId, userId))
		.all();

	return repremands;
});
