import { z } from 'zod';

const schema = z.object({
	from: z.string().datetime(),
	to: z.string().datetime(),
});

const maxConsecutiveDays = 2;

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const body = await readValidatedBody(event, schema.parse);

	const from = new Date(body.from);
	const to = new Date(body.to);

	// If from is later than to, return 400 Bad Request
	if (from > to) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
		});
	}

	// If from is earlier than now, return 400 Bad Request
	if (from < new Date()) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
		});
	}

	// If booking is longer than maxConsecutiveDays, return 400 Bad Request
	if (
		to.getTime() - from.getTime() >
		maxConsecutiveDays * 24 * 60 * 60 * 1000
	) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
		});
	}

	// Is there a booking that overlaps with the new booking?
	const overlappingBooking = await useDrizzle()
		.select()
		.from(tables.communalBookings)
		.where(
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
