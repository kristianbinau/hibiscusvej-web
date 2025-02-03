import { z } from 'zod';

const LOG_MODULE = 'Api/Admin/Bookings/[id]/Delete';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const ADMIN_ACTION = 'DeleteBooking';

export default eventHandler(async (event) => {
	const authAdmin = await useAuthAdmin(event);
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

	try {
		await useDrizzle()
			.insert(tables.adminLogs)
			.values({
				userId: authAdmin.user.id,
				action: `${ADMIN_ACTION}: ${id}`,
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
