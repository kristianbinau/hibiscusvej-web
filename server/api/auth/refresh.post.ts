export default eventHandler(async (event) => {
	const refreshToken = getCookie(event, REFRESH_COOKIE_NAME);
	if (!refreshToken) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If refreshToken is not valid, return 401 Unauthorized
	let currentDecodedRefreshToken;
	try {
		currentDecodedRefreshToken = (await verifyToken(refreshToken)) as {
			payload: { aud: string; jti: string };
		};

		// If refreshToken is not an REFRESH_AUDIENCE or REFRESH_AUDIENCE_ADMIN token, return 401 Unauthorized
		if (
			currentDecodedRefreshToken.payload.aud !== REFRESH_AUDIENCE &&
			currentDecodedRefreshToken.payload.aud !== REFRESH_AUDIENCE_ADMIN
		) {
			throw createError({
				statusCode: 401,
				statusMessage: 'Unauthorized',
			});
		}
	} catch (error) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If UserSession w/ tokenfamily is not found, return 401 Unauthorized
	const userSession = await useDrizzle()
		.select({
			userLoginId: tables.userSessions.userLoginId,
			refreshToken: tables.userSessions.refreshToken,
		})
		.from(tables.userSessions)
		.where(
			eq(
				tables.userSessions.tokenFamily,
				currentDecodedRefreshToken.payload.jti,
			),
		)
		.get();
	if (!userSession) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If UserSession does not match refreshToken, return 401 Unauthorized
	if (userSession.refreshToken !== refreshToken) {
		// Delete refreshToken - this is a security measure to prevent token replay attacks
		deleteCookie(event, REFRESH_COOKIE_NAME);
		await useDrizzle()
			.delete(tables.userSessions)
			.where(
				eq(
					tables.userSessions.tokenFamily,
					currentDecodedRefreshToken.payload.jti,
				),
			)
			.get();

		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If UserLogin w/ UserLogin is not found, return 401 Unauthorized
	const userLogin = await useDrizzle()
		.select({
			userId: tables.userLogins.userId,
		})
		.from(tables.userLogins)
		.where(eq(tables.userLogins.id, userSession.userLoginId))
		.get();
	if (!userLogin) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	// If User w/ UserLogin is not found, return 401 Unauthorized
	const user = await useDrizzle()
		.select()
		.from(tables.users)
		.where(eq(tables.users.id, userLogin.userId))
		.get();
	if (!user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized',
		});
	}

	/**
	 * We now know that the refreshToken is valid and that the userSession, userLogin, and user exist.
	 * We can now generate new tokens and update the refreshToken in the UserSession table.
	 */

	// Try to generate new tokens
	try {
		const { refreshToken, accessToken } = await generateTokens(
			userLogin.userId,
			Boolean(user.admin),
			currentDecodedRefreshToken.payload.jti,
		);
		const newDecodedRefreshToken = (await verifyToken(refreshToken)) as {
			payload: { exp: number; jti: string };
		};

		// Update refreshToken in UserSession table
		await useDrizzle()
			.update(tables.userSessions)
			.set({
				refreshToken: refreshToken,
				updatedAt: new Date(),
			})
			.where(
				eq(tables.userSessions.tokenFamily, newDecodedRefreshToken.payload.jti),
			)
			.get();

		// Set refreshToken cookie
		setCookie(event, REFRESH_COOKIE_NAME, refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/api/auth/refresh',
			maxAge:
				newDecodedRefreshToken.payload.exp - Math.floor(Date.now() / 1000),
		});

		// Return accessToken
		return {
			accessToken: accessToken,
		};
	} catch (error) {
		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
