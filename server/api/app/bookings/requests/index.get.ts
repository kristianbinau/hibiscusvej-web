import { startOfMonth, endOfMonth } from 'date-fns';
import { z } from 'zod/v4';

const querySchema = z.object({
	year: z.coerce.number().min(2024),
	month: z.coerce.number().min(1).max(12),
});

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const query = await getValidatedQuery(event, (data) =>
		querySchema.parse(data),
	);

	const year = query.year;
	const month = query.month;

	const date = new Date(year, month - 1, 1, 0, 0, 0, 0);
	const startDate = startOfMonth(date);
	const endDate = endOfMonth(date);

	// Get all bookings for the month
	const bookings = await useDrizzle()
		.select()
		.from(tables.communalBookingRequests)
		.where(
			and(
				eq(tables.communalBookingRequests.userId, authUser.user.id),
				isNull(tables.communalBookingRequests.deletedAt),
				isNull(tables.communalBookingRequests.handledAt),
				or(
					and(
						gte(tables.communalBookingRequests.fromTimestamp, startDate),
						lte(tables.communalBookingRequests.fromTimestamp, endDate),
					),
					and(
						gte(tables.communalBookingRequests.toTimestamp, startDate),
						lte(tables.communalBookingRequests.toTimestamp, endDate),
					),
				),
			),
		)
		.all();

	return bookings;
});
