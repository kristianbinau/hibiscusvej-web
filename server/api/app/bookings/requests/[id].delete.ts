import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Booking/Requests/Delete';

const routeSchema = z.object({
	id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const params = await getValidatedRouterParams(event, (data) =>
		routeSchema.parse(data),
	);

	const id = params.id;
	const now = new Date();

	try {
		await useDrizzle()
			.update(tables.communalBookingRequests)
			.set({
				deletedAt: now,
			})
			.where(
				and(
					isNull(tables.communalBookingRequests.handledAt),
					eq(tables.communalBookingRequests.id, id),
					eq(tables.communalBookingRequests.userId, authUser.user.id),
					gte(tables.communalBookingRequests.fromTimestamp, now),
				),
			);
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Update', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
