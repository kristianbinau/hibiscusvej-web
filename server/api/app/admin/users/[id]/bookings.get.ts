import { z } from 'zod';

const routeSchema = z.object({
	id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
	await useAuthAdmin(event);
	const params = await getValidatedRouterParams(event, routeSchema.parse);

	const id = params.id;

	const user = await useDrizzle()
		.select()
		.from(tables.users)
		.where(and(isNull(tables.users.deletedAt), eq(tables.users.id, id)))
		.get();

	if (!user) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
		});
	}

	const bookings = await useDrizzle()
		.select()
		.from(tables.communalBookings)
		.where(eq(tables.communalBookings.userId, id))
		.all();

	return bookings;
});
