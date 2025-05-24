import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Auth/Login';

const bodySchema = z.object({
	loginId: z.number(),
	singleUsePassword: z.string(),
	newPassword: z.string(),
});

export default defineEventHandler(async (event) => {
	const body = await readValidatedBody(event, bodySchema.parse);

	// If UserLogin w/ Email is not found, return 401 Unauthorized
	const userLogin = await useDrizzle()
		.select()
		.from(tables.userLogins)
		.where(eq(tables.userLogins.id, body.loginId))
		.get();
	if (!userLogin) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If UserLogin is not single use, return 401 Unauthorized
	if (!userLogin.singleUse) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If Password does not match, return 401 Unauthorized
	const passwordMatch = await comparePassword(
		body.singleUsePassword,
		userLogin.password,
	);
	if (!passwordMatch) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If User w/ UserLogin is not found, return 401 Unauthorized
	const user = await useDrizzle()
		.select()
		.from(tables.users)
		.where(
			and(
				eq(tables.users.id, userLogin.userId),
				isNull(tables.users.deletedAt),
			),
		)
		.get();
	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	try {
		const hashedPassword = await hashPassword(body.newPassword);

		await useDrizzle()
			.update(tables.userLogins)
			.set({
				password: hashedPassword,
				singleUse: false,
				updatedAt: new Date(),
			})
			.where(eq(tables.userLogins.id, userLogin.id));

		return true;
	} catch (error) {
		logError(LOG_MODULE, 'Failed Login Response', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
