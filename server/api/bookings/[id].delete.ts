import { z } from 'zod';

const schema = z.object({
	id: z.coerce.number(),
});

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const query = await getValidatedRouterParams(event, schema.parse);

	const id = query.id;
	const now = new Date();

	try {
		await useDrizzle()
			.delete(tables.communalBookings)
			.where(
				and(
					eq(tables.communalBookings.id, id),
					eq(tables.communalBookings.userId, authUser.user.id),
					gte(tables.communalBookings.from, now),
				),
			);
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error',
		});
	}

	setResponseStatus(event, 204);
	return {};
});
