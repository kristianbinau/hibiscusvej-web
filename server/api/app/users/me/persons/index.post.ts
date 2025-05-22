import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Users/Me/Persons/[id]/Post';

const bodySchema = z.object({
	name: z.string().min(1).max(255),
	email: z.email().min(1).max(255),
	phone: z.string().min(1).max(255),
});

export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);
	const body = await readValidatedBody(event, bodySchema.parse);

	// If User already has 2 persons, return 400 Bad Request - Cannot create more than 2 persons
	const count = await useDrizzle().$count(
		tables.userPersons,
		eq(tables.userPersons.userId, authUser.user.id),
	);

	if (count >= 2) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Bad Request',
		});
	}

	let person;
	try {
		const now = new Date();

		person = await useDrizzle()
			.insert(tables.userPersons)
			.values({
				userId: authUser.user.id,
				name: body.name,
				email: body.email,
				phone: body.phone,
				createdAt: now,
				updatedAt: now,
			})
			.returning()
			.get();
	} catch (error) {
		logError(LOG_MODULE, 'Failed Insert', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return {
		person: person,
	};
});
