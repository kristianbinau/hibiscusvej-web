import { z } from 'zod/v4';
import { UTCDateMini } from '@date-fns/utc';
import { checkBookingValidity } from '~~/server/api/app/bookings/index.post';
import {
	sendBookingRequestNotificationForAdmin,
	sendBookingRequestNotificationForUser,
} from '~~/server/utils/notification';
import { logAdminAction } from '~~/server/utils/log';

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

	// If permitted, check booking validity
	if (permitted) {
		const from = new UTCDateMini(bookingRequest.fromTimestamp);
		const to = new UTCDateMini(bookingRequest.toTimestamp);

		await checkBookingValidity(from, to);
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

	await logAdminAction({
		logModule: LOG_MODULE,
		adminAction: ADMIN_ACTION,
		adminActionParam: `${id}`,
		adminUserId: authAdmin.user.id,
	});

	/**
	 * Notify Admins
	 */

	await sendBookingRequestNotificationForAdmin({
		logModule: LOG_MODULE,
		userId: bookingRequest.userId,
		bookingRequestId: bookingRequest.id,
		title: 'Booking anmodning, behandlet',
		body: `#${bookingRequest.userId}'s anmodning er blevet behandlet.`,
	});

	/**
	 * Notify Users
	 */

	await sendBookingRequestNotificationForUser({
		logModule: LOG_MODULE,
		userId: bookingRequest.userId,
		bookingRequestId: bookingRequest.id,
		title: 'Booking anmodning, behandlet',
		body: `Din booking anmodning blev behandlet, gå til dine anmodninger for at se vurderingen.`,
	});

	return true;
});
