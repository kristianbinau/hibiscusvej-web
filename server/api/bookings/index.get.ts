import { startOfMonth, endOfMonth } from 'date-fns';
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

	const date = new Date(year, month - 1, 1, 0, 0, 0, 0);
	const startDate = startOfMonth(date);
	const endDate = endOfMonth(date);

	// Get all bookings for the month
	const bookings = await useDrizzle()
		.select()
		.from(tables.communalBookings)
		.where(
			and(
				isNull(tables.communalBookings.deletedAt),
				or(
					and(
						gte(tables.communalBookings.from, startDate),
						lte(tables.communalBookings.from, endDate),
					),
					and(
						gte(tables.communalBookings.to, startDate),
						lte(tables.communalBookings.to, endDate),
					),
				),
			),
		)
		.all();

	return bookings;
});
