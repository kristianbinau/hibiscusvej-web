import { z } from 'zod';

const schema = z.object({
	year: z.coerce.number().min(2024),
	month: z.coerce.number().min(1).max(12),
});

export default eventHandler(async (event) => {
	await useAuthUser(event);
	const query = await getValidatedQuery(event, schema.parse);

	const year = query.year;
	const month = query.month;

	// Get all bookings for the month
	const bookings = await useDrizzle()
		.select()
		.from(tables.communalBookings)
		.where(
			and(
				isNull(tables.communalBookings.deletedAt),
				gte(tables.communalBookings.from, new Date(year, month - 1, 1)),
				lte(
					tables.communalBookings.to,
					new Date(year, month, 0, 23, 59, 59, 999),
				),
			),
		)
		.all();

	return bookings;
});
