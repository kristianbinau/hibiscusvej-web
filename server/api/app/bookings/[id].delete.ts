import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Booking/Delete';

const routeSchema = z.object({
	id: z.coerce.number(),
});

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const params = await getValidatedRouterParams(event, routeSchema.parse);

	const id = params.id;
	const now = new Date();

	try {
		await useDrizzle()
			.update(tables.communalBookings)
			.set({
				deletedAt: now,
			})
			.where(
				and(
					eq(tables.communalBookings.id, id),
					eq(tables.communalBookings.userId, authUser.user.id),
					gte(tables.communalBookings.from, now),
				),
			);
	} catch (error) {
		logError(LOG_MODULE, 'Failed Update', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
