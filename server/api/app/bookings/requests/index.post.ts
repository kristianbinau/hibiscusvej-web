import { z } from 'zod/v4';
import { UTCDateMini } from '@date-fns/utc';
import { endOfYesterday, isAfter, addDays } from 'date-fns';
import { sendBookingRequestNotificationForAdmin } from '~~/server/utils/notification';

const LOG_MODULE = 'Api/Booking/Request/Create';

const bodySchema = z.object({
	date: z.iso.date(),
	requestNeededReasons: z.array(z.string()).min(1),
	requestText: z.string(),
});

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
			message: 'Der er allerede en booking i det tidsrum',
		});
	}

	// Is there a booking request that overlaps with the new booking request from the same user?
	const overlappingBookingRequest = await useDrizzle()
		.select()
		.from(tables.communalBookingRequests)
		.where(
			and(
				eq(tables.communalBookingRequests.userId, authUser.user.id),
				isNull(tables.communalBookingRequests.deletedAt),
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
		.get();

	// If there is an overlapping booking request, return 409 Conflict
	if (overlappingBookingRequest) {
		throw createError({
			statusCode: 409,
			statusMessage: 'Conflict',
			message: 'Du har allerede en anmodning i det tidsrum',
		});
	}

	// Insert the new booking request
	let bookingRequest;
	try {
		bookingRequest = await useDrizzle()
			.insert(tables.communalBookingRequests)
			.values({
				userId: authUser.user.id,
				fromTimestamp: from,
				toTimestamp: to,

				requestNeededReasons: JSON.stringify(body.requestNeededReasons),
				requestText: body.requestText,

				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning()
			.get();
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Insert', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	/**
	 * Notify Admins
	 */

	await sendBookingRequestNotificationForAdmin({
		logModule: LOG_MODULE,
		userId: user.id,
		bookingRequestId: bookingRequest.id,
		title: 'Ny booking anmodning!',
		body: `#${user.id} har lavet en ny anmodning, der skal behandles.`,
	});

	setResponseStatus(event, 201);
	return {
		bookingRequest: bookingRequest,
	};
});
