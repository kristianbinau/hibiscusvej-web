import { subDays } from 'date-fns';
import { desc } from 'drizzle-orm';

const HISTORY_DAYS = 180;

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);

	// Get all my bookings for the last HISTORY_DAYS days
	const bookings = await useDrizzle()
		.select()
		.from(tables.communalBookings)
		.where(
			and(
				gte(tables.communalBookings.from, subDays(new Date(), HISTORY_DAYS)),
				eq(tables.communalBookings.userId, authUser.user.id),
			),
		)
		.orderBy(desc(tables.communalBookings.from))
		.all();

	return bookings;
});
