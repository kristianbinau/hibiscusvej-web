import { z } from 'zod/v4';
import { UTCDateMini } from '@date-fns/utc';
import { endOfYesterday, isAfter, addDays } from 'date-fns';

const LOG_MODULE = 'Api/Booking/Create';

const bodySchema = z.object({
	date: z.string().date(),
});

const maxConsecutiveDays = 2;

export default defineEventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const body = await readValidatedBody(event, bodySchema.parse);

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
			statusMessage: 'Din bruger er ikke verificeret.',
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
			statusMessage:
				'Start tidspunktet skal være tidligere end slut tidspunktet.',
		});
	}

	// If from is yesterday, return 400 Bad Request
	if (!isAfter(from, endOfYesterday())) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Booking kan ikke starte i fortiden.',
		});
	}

	// If booking is longer than maxConsecutiveDays, return 400 Bad Request
	if (
		to.getTime() - from.getTime() >
		maxConsecutiveDays * 24 * 60 * 60 * 1000
	) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Booking vare længere end max tilladt.',
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
						gte(tables.communalBookings.from, from),
						lte(tables.communalBookings.from, to),
					),
					and(
						gte(tables.communalBookings.to, from),
						lte(tables.communalBookings.to, to),
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

	// Insert the new booking
	let booking;
	try {
		booking = await useDrizzle()
			.insert(tables.communalBookings)
			.values({
				userId: authUser.user.id,
				from: from,
				to: to,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.execute();
	} catch (error) {
		logError(LOG_MODULE, 'Failed Insert', error);
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
