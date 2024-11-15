export default eventHandler(async (event) => {
    const users = await useDrizzle().select().from(tables.users).all()

    // TODO - Actually implement login logic

    const user = users[0] // Logged in user

    // JWT tokens generation both accessToken and refreshToken
    const { refreshToken, accessToken } = await generateTokens(user, null)
    const decodedRefreshToken = await verifyToken(refreshToken) as { payload: { exp: number, jti: string } };

    console.log('refreshToken:', refreshToken)
    console.log('payload:', decodedRefreshToken)

    // Add refreshToken to UserSession table
    await useDrizzle().insert(tables.userSessions).values({
        userId: user.id,
        refreshToken: refreshToken,
        tokenFamily: decodedRefreshToken.payload.jti,
        expiredAt: new Date(decodedRefreshToken.payload.exp * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
    }).get()

    // Send refreshToken as a cookie
    setCookie(event, 'REFRESH-TOKEN', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/api/auth/refresh',
        maxAge: decodedRefreshToken.payload.exp - Math.floor(Date.now() / 1000),
    })

    // Return accessToken
    return {
        accessToken: accessToken,
    }
})