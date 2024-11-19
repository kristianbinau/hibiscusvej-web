export default eventHandler(async (event) => {
	const authUser = await useAuthUser(event);

	// If UserSession w/ tokenfamily is not found, return 401 Unauthorized
	const userSession = await useDrizzle()
		.select({
			userLoginId: tables.userSessions.userLoginId,
		})
		.from(tables.userSessions)
		.where(eq(tables.userSessions.tokenFamily, authUser.session.family))
		.get();
	if (!userSession) {
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

	// Try to generate new tokens
	try {
		const { refreshToken, accessToken } = await generateTokens(
			userLogin.userId,
			authUser.session.family,
		);
		const decodedRefreshToken = (await verifyToken(refreshToken)) as {
			payload: { exp: number; jti: string };
		};

		// Update refreshToken in UserSession table
		await useDrizzle()
			.update(tables.userSessions)
			.set({
				refreshToken: refreshToken,
				updatedAt: new Date(),
			})
			.where(eq(tables.userSessions.tokenFamily, authUser.session.family))
			.get();

		// Set refreshToken cookie
		setCookie(event, 'REFRESH-TOKEN', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			path: '/api/auth/refresh',
			maxAge: decodedRefreshToken.payload.exp - Math.floor(Date.now() / 1000),
		});
	} catch (error) {
		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal Server Error',
		});
	}
});
