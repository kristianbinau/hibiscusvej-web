import { z } from 'zod/v4';
import { UTCDateMini } from '@date-fns/utc';
import { endOfYesterday, isAfter, addDays } from 'date-fns';

const LOG_MODULE = 'Api/Admin/Bookings/Requests/[id]/Handle';

const routeSchema = z.object({
	id: z.coerce.number(),
});

const bodySchema = z.object({
	permitted: z.boolean().default(false),
	handledText: z.string().max(500).optional(),
});

const ADMIN_ACTION = 'HandleBookingRequest';

export default defineEventHandler(async (event) => {
	const authAdmin = await useAuthAdmin(event);
	const params = await getValidatedRouterParams(event, (data) =>
		routeSchema.parse(data),
	);
	const body = await readValidatedBody(event, (data) => bodySchema.parse(data));

	const id = params.id;

	const permitted = body.permitted;
	const handledText = body.handledText || null;

	const now = new Date();

	const bookingRequest = await useDrizzle()
		.select()
		.from(tables.communalBookingRequests)
		.where(eq(tables.communalBookingRequests.id, id))
		.get();

	if (!bookingRequest) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Not Found',
			message: 'Booking request not found.',
		});
	}

	if (bookingRequest.handledAt !== null) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
			message: 'Booking request has already been handled.',
		});
	}

	// If permitted, check if the booking can be created
	// (i.e. no overlapping bookings, not in the past)
	if (permitted) {
		const from = new UTCDateMini(bookingRequest.fromTimestamp);
		const to = new UTCDateMini(bookingRequest.toTimestamp);

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
	}

	try {
		await useDrizzle()
			.update(tables.communalBookingRequests)
			.set({
				permitted,
				handledText,
				handledAt: now,
				handledBy: authAdmin.user.id,
			})
			.where(eq(tables.communalBookingRequests.id, id))
			.execute();
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Update', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	if (permitted && bookingRequest) {
		// Create a booking if the request was permitted
		try {
			await useDrizzle()
				.insert(tables.communalBookings)
				.values({
					userId: bookingRequest.userId,
					fromTimestamp: bookingRequest.fromTimestamp,
					toTimestamp: bookingRequest.toTimestamp,
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
	}

	try {
		await useDrizzle()
			.insert(tables.adminLogs)
			.values({
				userId: authAdmin.user.id,
				action: `${ADMIN_ACTION}: ${id}`,
				createdAt: now,
			});
	} catch (error) {
		void logError(LOG_MODULE, 'Failed AdminLog', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

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

		const topic = `admin_notify_new_booking_request-${bookingRequest.userId}-${bookingRequest.id}`;
		const title = 'Booking anmodning, behandlet';
		const body = `#${bookingRequest.userId}'s anmodning er blevet behandlet.`;

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
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Notify Admins', error);
	}

	/**
	 * Notify Users
	 */
	try {
		const topic = `user_notify_booking_request-${bookingRequest.userId}-${bookingRequest.id}`;
		const title = 'Booking anmodning, behandlet';
		const body = `Din booking anmodning blev behandlet, gå til dine anmodninger for at se vurderingen.`;

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

		await sendPushNotificationToUserIds([bookingRequest.userId], pushMessage);
	} catch (error) {
		void logError(LOG_MODULE, 'Failed Notify Users', error);
	}

	return true;
});
