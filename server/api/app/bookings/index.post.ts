import { z } from 'zod/v4';
import { type UTCDate, UTCDateMini } from '@date-fns/utc';
import { endOfYesterday, isAfter, addDays, isBefore } from 'date-fns';

const LOG_MODULE = 'Api/Booking/Create';

const bodySchema = z.object({
	date: z.iso.date(),
});

const maxConsecutiveDays = 1;
const maxDaysPerWeek = 3;
const maxDaysPerMonth = 10;

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));

	const user = await useDrizzle()
		.select()
		.from(tables.users)
		.where(
			and(
				eq(tables.users.id, authUser.user.id),
				isNull(tables.users.deletedAt),
			),
		)
		.get();

	// If user is not found, return 401 Unauthorized
	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If user is not verified, return 403 Forbidden
	if (user.verifiedAt === null) {
		throw createError({
			statusCode: 403,
			statusMessage: 'Forbidden',
			message: 'Din bruger er ikke verificeret.',
		});
	}

	const date = new UTCDateMini(body.date);
	const from = new UTCDateMini(date);
	const to = new UTCDateMini(addDays(from, 1));

	from.setHours(10, 0, 0, 0);
	to.setHours(9, 59, 59, 0);

	// If from is later than to, return 400 Bad Request
	if (isAfter(from, to)) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid Time Range',
			message: 'Start tidspunktet skal være tidligere end slut tidspunktet.',
		});
	}

	// If from is yesterday, return 400 Bad Request
	if (!isAfter(from, endOfYesterday())) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid Time Range',
			message: 'Booking kan ikke starte i fortiden.',
		});
	}

	// Is there a booking that overlaps with the new booking?
	const overlappingBooking = await useDrizzle()
		.select()
		.from(tables.communalBookings)
		.where(
			and(
				isNull(tables.communalBookings.deletedAt),
				or(
					and(
						gte(tables.communalBookings.fromTimestamp, from),
						lte(tables.communalBookings.fromTimestamp, to),
					),
					and(
						gte(tables.communalBookings.toTimestamp, from),
						lte(tables.communalBookings.toTimestamp, to),
					),
				),
			),
		)
		.get();

	// If there is an overlapping booking, return 409 Conflict
	if (overlappingBooking) {
		throw createError({
			statusCode: 409,
			statusMessage: 'Conflict',
		});
	}

	/**
	 * Check booking limits
	 */

	if (shouldCheckBookingLimits(user, date)) {
		if ((await checkConsecutiveBookings(user.id, date)) >= maxConsecutiveDays) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Max Consecutive Bookings Reached',
				message:
					maxConsecutiveDays > 1
						? `Du kan maksimalt have ${maxConsecutiveDays} sammenhængende bookinger.`
						: 'Du kan ikke have sammenhængende bookinger.',
			});
		}

		if ((await checkWeekBookings(user.id, date)) >= maxDaysPerWeek) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Max Weekly Bookings Reached',
				message: `Du kan maksimalt have ${maxDaysPerWeek} bookinger hver 7. dag.`,
			});
		}

		if ((await checkMonthBookings(user.id, date)) >= maxDaysPerMonth) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Max Monthly Bookings Reached',
				message: `Du kan maksimalt have ${maxDaysPerMonth} bookinger hver 31. dag.`,
			});
		}
	}

	// Insert the new booking
	let booking;
	try {
		booking = await useDrizzle()
			.insert(tables.communalBookings)
			.values({
				userId: authUser.user.id,
				fromTimestamp: from,
				toTimestamp: to,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.execute();
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Insert', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	// Close any existing booking requests that overlap with the new booking
	try {
		const updatedBookingRequests = await useDrizzle()
			.update(tables.communalBookingRequests)
			.set({
				handledBy: authUser.user.id,
				handledText:
					'Automatisk lukket ved oprettelse af booking af anden bruger',
				handledAt: new Date(),
				updatedAt: new Date(),
			})
			.where(
				and(
					isNull(tables.communalBookingRequests.deletedAt),
					isNull(tables.communalBookingRequests.handledAt),
					or(
						and(
							gte(tables.communalBookingRequests.fromTimestamp, from),
							lte(tables.communalBookingRequests.fromTimestamp, to),
						),
						and(
							gte(tables.communalBookingRequests.toTimestamp, from),
							lte(tables.communalBookingRequests.toTimestamp, to),
						),
					),
				),
			)
			.returning()
			.all();

		/**
		 * Notify Admins
		 */
		try {
			const admins = await useDrizzle()
				.select()
				.from(tables.users)
				.where(eq(tables.users.admin, true))
				.all();
			const adminUserIds = admins.map((admin) => admin.id);

			for (const bookingRequest of updatedBookingRequests) {
				const topic = `admin_notify_new_booking_request-${bookingRequest.userId}-${bookingRequest.id}`;
				const title = 'Booking anmodning, lukket automatisk';
				const body = `#${bookingRequest.userId} fik lukket en anmodning automatisk, da der blev oprettet en booking.`;

				const pushMessage = {
					data: JSON.stringify({
						title: title,
						options: {
							body: body,
							tag: topic,
							link: `/u/admin/booking-requests`,
							silent: true,
						},
					}),
					options: {
						topic: topic,
						ttl: 86400,
						urgency: 'normal' as const,
					},
				} as WebPushMessage;

				await sendPushNotificationToUserIds(adminUserIds, pushMessage);
			}
		} catch (error) {
			void logError(LOG_MODULE, 'Failed Notify Admins', error);
		}

		/**
		 * Notify Users
		 */
		try {
			for (const bookingRequest of updatedBookingRequests) {
				const topic = `user_notify_booking_request-${bookingRequest.userId}-${bookingRequest.id}`;
				const title = 'Booking anmodning, lukket automatisk';
				const body = `Din booking anmodning blev lukket automatisk, da der blev oprettet en booking af en anden bruger.`;

				const pushMessage = {
					data: JSON.stringify({
						title: title,
						options: {
							body: body,
							tag: topic,
							link: `/u/me-requests`,
							silent: true,
						},
					}),
					options: {
						topic: topic,
						ttl: 86400,
						urgency: 'normal' as const,
					},
				} as WebPushMessage;

				await sendPushNotificationToUserIds(
					[bookingRequest.userId],
					pushMessage,
				);
			}
		} catch (error) {
			void logError(LOG_MODULE, 'Failed Notify Users', error);
		}
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Update', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	setResponseStatus(event, 201);
	return {
		booking: booking,
	};
});

function shouldCheckBookingLimits(user: User, date: UTCDate): boolean {
	// Admins are not subject to booking limits
	//if (user.admin) return false;

	const today = new UTCDateMini();
	const twoDaysFromNow = addDays(today, 2);

	// If the booking is within the next two days, do not check limits
	if (isBefore(date, twoDaysFromNow)) {
		return false;
	}

	return true;
}

/**
 * Count number of consecutive bookings the user has before and after the given date
 */
async function checkConsecutiveBookings(
	userId: number,
	date: UTCDate,
): Promise<number> {
	let amount = 0;

	let previousDate = addDays(date, -1);

	while (true) {
		const res = await useDrizzle()
			.select({ count: count() })
			.from(tables.communalBookings)
			.where(
				and(
					eq(tables.communalBookings.userId, userId),
					isNull(tables.communalBookings.deletedAt),
					gte(
						tables.communalBookings.fromTimestamp,
						new UTCDateMini(previousDate),
					),
					lte(
						tables.communalBookings.fromTimestamp,
						addDays(new UTCDateMini(previousDate), 1),
					),
				),
			)
			.get();

		if (res?.count && res.count > 0) {
			amount++;
			previousDate = addDays(previousDate, -1);
		} else {
			break;
		}
	}

	let nextDate = addDays(date, 1);

	while (true) {
		const res = await useDrizzle()
			.select({ count: count() })
			.from(tables.communalBookings)
			.where(
				and(
					eq(tables.communalBookings.userId, userId),
					isNull(tables.communalBookings.deletedAt),
					gte(tables.communalBookings.fromTimestamp, new UTCDateMini(nextDate)),
					lte(
						tables.communalBookings.fromTimestamp,
						addDays(new UTCDateMini(nextDate), 1),
					),
				),
			)
			.get();

		if (res?.count && res.count > 0) {
			amount++;
			nextDate = addDays(nextDate, 1);
		} else {
			break;
		}
	}

	return amount;
}

/**
 * Count number of bookings the user has in the nearest 7 days, going back 3 days and forward 3 days from the given date
 */
async function checkWeekBookings(
	userId: number,
	date: UTCDate,
): Promise<number> {
	const startOfPeriod = addDays(date, -3);
	const endOfPeriod = addDays(date, 3);

	const res = await useDrizzle()
		.select({ count: count() })
		.from(tables.communalBookings)
		.where(
			and(
				eq(tables.communalBookings.userId, userId),
				isNull(tables.communalBookings.deletedAt),
				gte(tables.communalBookings.fromTimestamp, startOfPeriod),
				lte(tables.communalBookings.fromTimestamp, endOfPeriod),
			),
		)
		.get();

	return res?.count ?? 0;
}

/**
 * Count number of bookings the user has in the nearest 30 days, going backwards 15 days and forwards 15 days from the given date
 */
async function checkMonthBookings(
	userId: number,
	date: UTCDate,
): Promise<number> {
	const startOfPeriod = addDays(date, -15);
	const endOfPeriod = addDays(date, 15);

	const res = await useDrizzle()
		.select({ count: count() })
		.from(tables.communalBookings)
		.where(
			and(
				eq(tables.communalBookings.userId, userId),
				isNull(tables.communalBookings.deletedAt),
				gte(tables.communalBookings.fromTimestamp, startOfPeriod),
				lte(tables.communalBookings.fromTimestamp, endOfPeriod),
			),
		)
		.get();

	return res?.count ?? 0;
}
