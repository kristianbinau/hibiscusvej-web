import { subDays } from 'date-fns';

const HISTORY_DAYS = 180;

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);

	// Get all my bookings for the last HISTORY_DAYS days
	const bookings = await useDrizzle()
		.select()
		.from(tables.communalBookingRequests)
		.where(
			and(
				isNull(tables.communalBookingRequests.deletedAt),
				isNull(tables.communalBookingRequests.handledAt),
				gte(
					tables.communalBookingRequests.fromTimestamp,
					subDays(new Date(), HISTORY_DAYS),
				),
				eq(tables.communalBookingRequests.userId, authUser.user.id),
			),
		)
		.orderBy(desc(tables.communalBookingRequests.fromTimestamp))
		.all();

	return bookings;
});
