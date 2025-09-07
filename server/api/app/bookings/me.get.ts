import { subDays } from 'date-fns';

const HISTORY_DAYS = 180;

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);

	// Get all my bookings for the last HISTORY_DAYS days
	const bookings = await useDrizzle()
		.select()
		.from(tables.communalBookings)
		.where(
			and(
				isNull(tables.communalBookings.deletedAt),
				gte(tables.communalBookings.fromTimestamp, subDays(new Date(), HISTORY_DAYS)),
				eq(tables.communalBookings.userId, authUser.user.id),
			),
		)
		.orderBy(desc(tables.communalBookings.fromTimestamp))
		.all();

	return bookings;
});
