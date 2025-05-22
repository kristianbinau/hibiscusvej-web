import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Users/Me/Logins/[id]/Post';

const bodySchema = z.object({
	email: z.email(),
	password: z.string(),
	currentSessionPassword: z.string(),
});

export default eventHandler(async (event) => {
	const body = await readValidatedBody(event, bodySchema.parse);
	const authUser = await useAuthValidatedUser(
		event,
		body.currentSessionPassword,
	);

	// If Email is already in use, return 409 Conflict
	const userByEmail = await useDrizzle()
		.select()
		.from(tables.userLogins)
		.where(eq(tables.userLogins.email, body.email))
		.get();
	if (userByEmail) {
		throw createError({
			statusCode: 409,
			statusMessage: 'Conflict',
		});
	}

	try {
		const hashedPassword = await hashPassword(body.password);
		const now = new Date();

		await useDrizzle().insert(tables.userLogins).values({
			userId: authUser.user.id,
			email: body.email,
			password: hashedPassword,
			singleUse: false,
			createdAt: now,
			updatedAt: now,
		});
	} catch (error) {
		logError(LOG_MODULE, 'Failed Insert', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}

	return true;
});
