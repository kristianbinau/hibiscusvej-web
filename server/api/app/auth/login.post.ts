import { z } from 'zod/v4';

const LOG_MODULE = 'Api/Auth/Login';

const bodySchema = z.object({
	email: z.string(),
	password: z.string(),
});

export default eventHandler(async (event) => {
	const body = await readValidatedBody(event, bodySchema.parse);

	// If UserLogin w/ Email is not found, return 401 Unauthorized
	const userLogin = await useDrizzle()
		.select()
		.from(tables.userLogins)
		.where(eq(tables.userLogins.email, body.email.toLowerCase()))
		.get();
	if (!userLogin) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If Password does not match, return 401 Unauthorized
	const passwordMatch = await comparePassword(
		body.password,
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

	// If UserLogin is singleUse, return loginId and singleUse
	if (userLogin.singleUse) {
		return {
			loginId: userLogin.id,
			singleUse: true,
		};
	}

	// Try to generate tokens
	try {
		const { refreshToken, accessToken } = await generateTokens(
			user.id,
			user.admin,
			null,
		);
		const decodedRefreshToken = (await verifyToken(refreshToken)) as {
			payload: { exp: number; jti: string };
		};

		// Add refreshToken to UserSession table
		await useDrizzle()
			.insert(tables.userSessions)
			.values({
				userLoginId: userLogin.id,
				refreshToken: refreshToken,
				tokenFamily: decodedRefreshToken.payload.jti,
				expiredAt: new Date(decodedRefreshToken.payload.exp * 1000),
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.get();

		// Set refreshToken cookie
		setCookie(event, REFRESH_COOKIE_NAME, refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/api/app/auth/refresh',
			maxAge: decodedRefreshToken.payload.exp - Math.floor(Date.now() / 1000),
		});

		// Return accessToken
		return {
			accessToken: accessToken,
		};
	} catch (error) {
		logError(LOG_MODULE, 'Failed Login Response', error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
